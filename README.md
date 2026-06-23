# DebtTracker Pro

A personal lending management app built with Next.js 14, TypeScript, Supabase, and Tailwind CSS. Track borrowers, payments, interest, and follow-ups with ease.

## Features

- **Dashboard**: Overview of total loaned, outstanding balances, accrued interest, and collection metrics
- **Borrower Management**: Add, edit, and track borrowers with full details
- **Payment Recording**: Record principal, interest, penalty, and partial payments with multiple payment methods
- **Analytics**: Visual charts for repayment rates, loan distribution, and performance metrics
- **Reminders**: Set and manage follow-up reminders for borrowers
- **Interest Calculation**: Support for flat, compound, and reducing interest rates
- **Status Tracking**: Track borrower status (active, overdue, settled, written off)
- **Supabase Auth**: Email/password and Google OAuth authentication

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 3
- **Forms**: React Hook Form
- **Charts**: Recharts 2
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Utilities**: date-fns 3

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd debt-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Set up Supabase database:
- Go to Supabase Dashboard → SQL Editor
- Create a new query
- Copy and paste the contents of `supabase/schema.sql`
- Run the query

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
debt-tracker/
├── app/                           # Next.js app directory
│   ├── (auth)/                   # Auth routes (login, signup)
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── page.tsx             # Dashboard
│   │   ├── borrowers/           # Borrower management
│   │   ├── analytics/           # Analytics & charts
│   │   ├── reminders/           # Reminders
│   │   └── settings/            # User settings
│   ├── api/                      # API routes
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # Reusable UI components
│   ├── layout/                   # Sidebar, Topbar
│   ├── dashboard/                # Dashboard charts
│   ├── borrowers/                # Borrower components
│   ├── reminders/                # Reminder components
│   └── analytics/                # Analytics components
├── lib/
│   ├── supabase/                 # Supabase clients
│   ├── actions/                  # Server actions
│   ├── hooks/                    # React hooks
│   ├── types/                    # TypeScript types
│   └── utils/                    # Utility functions
├── supabase/
│   └── schema.sql                # Database schema
├── middleware.ts                 # Auth middleware
├── tailwind.config.ts            # Tailwind configuration
└── package.json
```

## Key Pages

### Dashboard (`/`)
- KPI metrics (total loaned, outstanding, accrued interest, collected)
- Loan breakdown chart
- Portfolio status pie chart
- Top borrowers table
- Interest rate chart
- Overdue alerts

### Borrowers (`/borrowers`)
- List of all borrowers with search and status filtering
- Add new borrower modal
- Edit borrower modal
- Record payment modal
- View individual borrower details

### Analytics (`/analytics`)
- Collection rate percentage
- Average interest rate
- Total accrued interest
- Repayment rate chart
- Loan distribution chart
- Interest earned chart
- Metrics table

### Reminders (`/reminders`)
- List of upcoming follow-ups
- Add reminder modal
- Dismiss reminders

### Settings (`/settings`)
- Profile information
- Currency and timezone
- Account security

## Database Schema

The Supabase schema includes:

- **profiles**: User profile data
- **borrowers**: Borrower information with auto-calculated fields
- **payments**: Payment records with type and method
- **reminders**: Follow-up reminders
- **activity_log**: Audit trail of actions
- **Views**:
  - `borrower_summary`: Enriched borrower data with calculated fields
  - `lender_portfolio`: Portfolio-level aggregations

## Colors & Design

- **Background**: `#0a0a0f`
- **Primary**: Cyan (`#22d3ee`)
- **Success**: Green (`#4ade80`)
- **Warning**: Orange (`#f97316`)
- **Error**: Red (`#f87171`)
- **Accent**: Purple (`#a78bfa`)

## Currency

Default currency is Philippine Peso (₱). Configure in user profile settings.

## Authentication

- Supabase Auth (email/password)
- Google OAuth integration
- Row-level security (RLS) enforced on all tables
- Session middleware for protected routes

## Development

### Run Tests
```bash
npm run test
```

### Build
```bash
npm run build
```

### Production
```bash
npm run start
```

## Best Practices

1. **Server Actions**: All mutations use server actions for security
2. **Type Safety**: Full TypeScript coverage
3. **Optimistic UI**: Client-side state updates with error recovery
4. **RLS Security**: Database policies enforced per user
5. **Revalidation**: Next.js cache invalidation on mutations
6. **Formatting**: All money values use `formatCurrency()` with JetBrains Mono

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a pull request

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
