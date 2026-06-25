-- ============================================================
--  DEBTTRACKER PRO — Supabase PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE 1: profiles
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  currency      TEXT NOT NULL DEFAULT 'PHP',
  timezone      TEXT NOT NULL DEFAULT 'Asia/Manila',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 2: borrowers
CREATE TABLE public.borrowers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  avatar_initials TEXT GENERATED ALWAYS AS (UPPER(LEFT(REGEXP_REPLACE(full_name, '\\s+', ' '), 2))) STORED,
  phone           TEXT,
  email           TEXT,
  notes           TEXT,
  total_borrowed  NUMERIC(14, 2) NOT NULL CHECK (total_borrowed > 0),
  interest_rate   NUMERIC(6, 3) NOT NULL DEFAULT 0 CHECK (interest_rate >= 0),
  interest_type   TEXT NOT NULL DEFAULT 'flat' CHECK (interest_type IN ('flat', 'compound', 'reducing')),
  loan_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE,
  penalty_rate    NUMERIC(6, 3) NOT NULL DEFAULT 2.0 CHECK (penalty_rate >= 0),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'overdue', 'settled', 'written_off')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_borrowers_lender ON public.borrowers (lender_id);
CREATE INDEX idx_borrowers_status ON public.borrowers (status);
CREATE INDEX idx_borrowers_due_date ON public.borrowers (due_date);
CREATE INDEX idx_borrowers_lender_status ON public.borrowers (lender_id, status);

-- TABLE 3: payments
CREATE TABLE public.payments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrower_id   UUID NOT NULL REFERENCES public.borrowers(id) ON DELETE CASCADE,
  lender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount        NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  payment_type  TEXT NOT NULL CHECK (payment_type IN ('principal', 'interest', 'penalty', 'partial')),
  payment_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  method        TEXT DEFAULT 'cash' CHECK (method IN ('cash', 'bank_transfer', 'gcash', 'maya', 'check', 'other')),
  reference_no  TEXT,
  notes         TEXT,
  recorded_by   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_borrower ON public.payments (borrower_id);
CREATE INDEX idx_payments_lender ON public.payments (lender_id);
CREATE INDEX idx_payments_date ON public.payments (payment_date DESC);
CREATE INDEX idx_payments_borrower_date ON public.payments (borrower_id, payment_date DESC);

-- TABLE 4: reminders
CREATE TABLE public.reminders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrower_id   UUID NOT NULL REFERENCES public.borrowers(id) ON DELETE CASCADE,
  lender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  remind_on     DATE NOT NULL,
  channel       TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'sms')),
  message       TEXT,
  is_sent       BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reminders_lender ON public.reminders (lender_id);
CREATE INDEX idx_reminders_remind_on ON public.reminders (remind_on);
CREATE INDEX idx_reminders_unsent ON public.reminders (is_sent) WHERE is_sent = FALSE;

-- TABLE 5: activity_log
CREATE TABLE public.activity_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  borrower_id   UUID REFERENCES public.borrowers(id) ON DELETE SET NULL,
  payment_id    UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  old_value     JSONB,
  new_value     JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activity_lender ON public.activity_log (lender_id);
CREATE INDEX idx_activity_borrower ON public.activity_log (borrower_id);
CREATE INDEX idx_activity_created ON public.activity_log (lender_id, created_at DESC);

-- VIEW: borrower_summary
-- security_invoker=true makes RLS from the underlying borrowers/payments tables apply to this view
CREATE VIEW public.borrower_summary WITH (security_invoker = true) AS
SELECT
  b.id, b.lender_id, b.full_name, b.avatar_initials,
  b.phone, b.email, b.total_borrowed, b.interest_rate,
  b.interest_type, b.loan_date, b.due_date, b.penalty_rate, b.status, b.notes,
  COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'principal'), 0) AS total_paid_principal,
  COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'interest'), 0) AS total_paid_interest,
  COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'penalty'), 0) AS total_paid_penalty,
  COALESCE(SUM(p.amount), 0) AS total_paid_all,
  b.total_borrowed - COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'principal'), 0) AS outstanding_principal,
  -- base interest on the original loan amount
  ROUND(b.total_borrowed * (b.interest_rate / 100), 2) AS base_interest,
  -- overdue penalty: penalty_rate% of original loan amount per day after due date
  ROUND(
    b.total_borrowed * (b.penalty_rate / 100)
    * GREATEST(CASE WHEN b.due_date < CURRENT_DATE AND b.status != 'settled' THEN CURRENT_DATE - b.due_date ELSE 0 END, 0),
    2
  ) AS overdue_interest,
  -- accrued interest = base interest + overdue penalty
  ROUND(
    ROUND(b.total_borrowed * (b.interest_rate / 100), 2)
    + b.total_borrowed * (b.penalty_rate / 100)
      * GREATEST(CASE WHEN b.due_date < CURRENT_DATE AND b.status != 'settled' THEN CURRENT_DATE - b.due_date ELSE 0 END, 0),
    2
  ) AS accrued_interest,
  -- total balance = (principal + base interest - all payments) + overdue penalty
  ROUND(
    GREATEST(
      (b.total_borrowed + ROUND(b.total_borrowed * (b.interest_rate / 100), 2) - COALESCE(SUM(p.amount), 0)),
      0
    )
    + b.total_borrowed * (b.penalty_rate / 100)
      * GREATEST(CASE WHEN b.due_date < CURRENT_DATE AND b.status != 'settled' THEN CURRENT_DATE - b.due_date ELSE 0 END, 0),
    2
  ) AS total_balance,
  COUNT(p.id) AS payment_count,
  MAX(p.payment_date) AS last_payment_date,
  CASE WHEN b.due_date < CURRENT_DATE AND b.status != 'settled' THEN CURRENT_DATE - b.due_date ELSE NULL END AS days_overdue,
  b.created_at, b.updated_at
FROM public.borrowers b
LEFT JOIN public.payments p ON p.borrower_id = b.id
GROUP BY b.id;

-- VIEW: lender_portfolio
-- security_invoker=true makes RLS apply through the borrower_summary view
CREATE VIEW public.lender_portfolio WITH (security_invoker = true) AS
SELECT
  lender_id,
  COUNT(*) AS total_borrowers,
  SUM(total_borrowed) AS total_loaned,
  SUM(outstanding_principal) AS total_outstanding,
  SUM(total_paid_principal) AS total_collected_principal,
  SUM(total_paid_interest) AS total_collected_interest,
  SUM(accrued_interest) AS total_accrued_interest,
  COUNT(*) FILTER (WHERE status = 'active') AS active_count,
  COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_count,
  COUNT(*) FILTER (WHERE status = 'settled') AS settled_count,
  ROUND(AVG(interest_rate), 2) AS avg_interest_rate,
  ROUND(SUM(total_paid_principal)::NUMERIC / NULLIF(SUM(total_borrowed), 0) * 100, 1) AS collection_rate_pct
FROM public.borrower_summary
GROUP BY lender_id;

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_borrowers_updated_at
  BEFORE UPDATE ON public.borrowers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.auto_settle_borrower()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_outstanding NUMERIC;
BEGIN
  SELECT outstanding_principal INTO v_outstanding
  FROM public.borrower_summary WHERE id = NEW.borrower_id;

  IF v_outstanding <= 0 THEN
    UPDATE public.borrowers SET status = 'settled', updated_at = NOW()
    WHERE id = NEW.borrower_id AND status != 'settled';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_settle
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.auto_settle_borrower();

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: own row only" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "borrowers: own data only" ON public.borrowers FOR ALL USING (auth.uid() = lender_id);
CREATE POLICY "payments: own data only" ON public.payments FOR ALL USING (auth.uid() = lender_id);
CREATE POLICY "reminders: own data only" ON public.reminders FOR ALL USING (auth.uid() = lender_id);
CREATE POLICY "activity_log: read own" ON public.activity_log FOR SELECT USING (auth.uid() = lender_id);
CREATE POLICY "activity_log: system insert" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = lender_id);
