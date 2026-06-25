'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  { label: 'Who needs a reminder?', prompt: 'Which borrowers need to be reminded about their payments right now?' },
  { label: 'Portfolio summary', prompt: 'Give me a quick summary of my loan portfolio and how it\'s performing.' },
  { label: 'Overdue borrowers', prompt: 'List all overdue borrowers with the amount they owe and how many days overdue.' },
  { label: 'Lending tips', prompt: 'What are some practical tips to improve my collection rate and manage lending risk?' },
];

const INITIAL_PROMPT =
  'Hello! Briefly analyze my portfolio: highlight any overdue borrowers I should contact today, and give me a one-line portfolio health status.';

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={i} className="font-semibold text-white">
              {line.slice(2, -2)}
            </p>
          );
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan/60" />
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        if (/^\d+\./.test(line)) {
          const num = line.match(/^(\d+)\./)?.[1];
          return (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 font-mono text-xs text-cyan/60">{num}.</span>
              <span>{line.replace(/^\d+\.\s*/, '')}</span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return (
          <p key={i}>
            {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j} className="font-semibold text-white">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function AiPageClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      sendMessage(INITIAL_PROMPT, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(text: string, isSystemInit = false) {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim() };
    const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' };

    setMessages((prev) => (isSystemInit ? [aiMsg] : [...prev, userMsg, aiMsg]));
    setInput('');
    setStreaming(true);

    const history = isSystemInit
      ? [{ role: 'user' as const, content: text.trim() }]
      : [...messages, userMsg].slice(-10).map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Server error ${res.status}`);
      }
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsg.id ? { ...m, content: m.content + chunk } : m))
        );
      }
    } catch (err) {
      const errText = err instanceof Error ? err.message : 'Unknown error';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id ? { ...m, content: `⚠️ ${errText}` } : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleReset() {
    setMessages([]);
    setInitialized(false);
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden rounded-[20px] border border-border bg-bg/80 shadow-card sm:h-[calc(100dvh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan/20 to-purple/20">
            <Bot className="h-5 w-5 text-cyan" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-green ring-2 ring-bg" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Lending Assistant</p>
            <p className="text-xs text-text/50">Powered by Groq · Always online</p>
          </div>
        </div>
        {hasMessages && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-text/40 transition hover:bg-white/5 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!hasMessages && (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan/10 to-purple/10">
              <Sparkles className="h-8 w-8 text-cyan" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Your AI Lending Assistant</p>
              <p className="mt-1.5 max-w-sm text-sm text-text/50">
                Ask me about your borrowers, get payment reminders, lending tips, or investment advice.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => sendMessage(action.prompt)}
                  className="rounded-full border border-border bg-white/5 px-4 py-2 text-sm text-text/70 transition hover:border-cyan/40 hover:bg-cyan/5 hover:text-white"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasMessages && (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    msg.role === 'user' ? 'bg-cyan/15' : 'bg-purple/15'
                  )}
                >
                  {msg.role === 'user' ? (
                    <User className="h-4 w-4 text-cyan" />
                  ) : (
                    <Bot className="h-4 w-4 text-purple" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    'max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%]',
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-cyan/10 text-white'
                      : 'rounded-tl-sm bg-white/[0.04] text-text/80'
                  )}
                >
                  {msg.content === '' && streaming ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan/60 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan/60 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan/60 [animation-delay:300ms]" />
                    </div>
                  ) : msg.role === 'assistant' ? (
                    <MarkdownText text={msg.content} />
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Quick actions after AI response */}
            {!streaming && messages[messages.length - 1]?.role === 'assistant' && (
              <div className="flex flex-wrap gap-2 pl-10">
                {QUICK_ACTIONS.slice(0, 2).map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => sendMessage(action.prompt)}
                    className="rounded-full border border-border bg-white/5 px-3 py-1.5 text-xs text-text/60 transition hover:border-cyan/40 hover:bg-cyan/5 hover:text-white"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-3 rounded-xl border border-border bg-white/5 px-4 py-3 focus-within:border-cyan/40">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your borrowers or lending…"
            rows={1}
            disabled={streaming}
            className="max-h-32 flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-text/30 disabled:opacity-50"
            style={{ lineHeight: '1.5rem' }}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan text-bg transition hover:bg-cyan/90 disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-text/25">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
