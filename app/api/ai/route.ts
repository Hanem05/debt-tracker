import Groq from 'groq-sdk';
import { createClient } from '@/lib/supabase/server';
import type { BorrowerSummary } from '@/lib/types';
import { NextRequest } from 'next/server';

function buildPortfolioContext(borrowers: BorrowerSummary[]): string {
  if (!borrowers.length) return 'The lender has no borrowers yet.';

  const overdue = borrowers.filter((b) => b.status === 'overdue');
  const active = borrowers.filter((b) => b.status === 'active');
  const settled = borrowers.filter((b) => b.status === 'settled');
  const totalLoaned = borrowers.reduce((s, b) => s + b.total_borrowed, 0);
  const totalOutstanding = borrowers.reduce((s, b) => s + Math.max(0, b.total_balance ?? 0), 0);

  const lines = [
    `PORTFOLIO SUMMARY`,
    `Total borrowers: ${borrowers.length} (${active.length} active, ${overdue.length} overdue, ${settled.length} settled)`,
    `Total loaned out: ₱${totalLoaned.toLocaleString('en-PH')}`,
    `Total outstanding: ₱${totalOutstanding.toLocaleString('en-PH')}`,
    ``,
    `BORROWER DETAILS:`,
    ...borrowers.map((b) => {
      const totalLoan = b.total_borrowed + (b.base_interest ?? 0);
      const balance = Math.max(0, b.total_balance ?? totalLoan - (b.total_paid_all ?? 0));
      const parts = [
        `Name: ${b.full_name}`,
        `Status: ${b.status}`,
        `Borrowed: ₱${b.total_borrowed.toLocaleString('en-PH')}`,
        `Interest: ${b.interest_rate}% (${b.interest_type})`,
        `Total Loan: ₱${totalLoan.toLocaleString('en-PH')}`,
        `Total Paid: ₱${(b.total_paid_all ?? 0).toLocaleString('en-PH')}`,
        `Outstanding Balance: ₱${balance.toLocaleString('en-PH')}`,
      ];
      if (b.due_date) parts.push(`Due Date: ${b.due_date}`);
      if (b.days_overdue && b.days_overdue > 0) parts.push(`Overdue by: ${b.days_overdue} days`);
      if (b.phone) parts.push(`Phone: ${b.phone}`);
      return `- ${parts.join(', ')}`;
    }),
  ];

  return lines.join('\n');
}

const SYSTEM_PROMPT = `You are a smart lending assistant built into DebtTracker Pro, a personal loan management app used by private lenders in the Philippines.

Your role:
1. Help the lender stay on top of their loan portfolio
2. Flag overdue borrowers and upcoming payment deadlines proactively
3. Give practical lending tips — interest rate strategy, risk management, collection best practices
4. Answer direct questions about specific borrowers using the live portfolio data provided
5. Offer general financial and investment advice when asked

Rules:
- Always use Philippine Peso (₱) for amounts
- Be concise, warm, and professional — like a trusted financial advisor
- Use bullet points or numbered lists for clarity when listing multiple items
- When referencing a borrower, include their balance and status
- If the lender asks "who needs a reminder?" → list overdue first, then those with due dates within 7 days
- Never make up data — only use what's in the portfolio provided
- Keep responses focused and actionable, not overly long`;

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    return new Response(
      'GROQ_API_KEY is not set. Please add your Groq API key to .env.local and restart the dev server.',
      { status: 503 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { messages } = (await req.json()) as {
    messages: { role: 'user' | 'assistant'; content: string }[];
  };

  if (!messages?.length) return new Response('Bad request', { status: 400 });

  try {
    const { data: borrowers } = await supabase
      .from('borrower_summary')
      .select('*')
      .order('full_name', { ascending: true });

    const portfolioContext = buildPortfolioContext((borrowers ?? []) as BorrowerSummary[]);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nCurrent portfolio data:\n${portfolioContext}` },
        ...messages,
      ],
      stream: true,
      max_tokens: 1024,
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) controller.enqueue(new TextEncoder().encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/ai] Groq error:', message);
    return new Response(message, { status: 500 });
  }
}
