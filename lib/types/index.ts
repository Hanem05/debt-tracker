export type InterestType = 'flat' | 'compound' | 'reducing';
export type BorrowerStatus = 'active' | 'overdue' | 'settled' | 'written_off';
export type PaymentType = 'principal' | 'interest' | 'penalty' | 'partial';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'gcash' | 'maya' | 'check' | 'other';
export type ReminderChannel = 'in_app' | 'email' | 'sms';

export interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Borrower {
  id: string;
  lender_id: string;
  full_name: string;
  avatar_initials: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  total_borrowed: number;
  interest_rate: number;
  interest_type: InterestType;
  loan_date: string;
  due_date: string | null;
  status: BorrowerStatus;
  created_at: string;
  updated_at: string;
}

export interface BorrowerSummary extends Borrower {
  total_paid_principal: number;
  total_paid_interest: number;
  total_paid_penalty: number;
  total_paid_all: number;
  outstanding_principal: number;
  base_interest: number;
  accrued_interest: number;
  overdue_interest: number;
  total_balance: number;
  payment_count: number;
  last_payment_date: string | null;
  days_overdue: number | null;
}

export interface Payment {
  id: string;
  borrower_id: string;
  lender_id: string;
  amount: number;
  payment_type: PaymentType;
  payment_date: string;
  method: PaymentMethod;
  reference_no: string | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  borrower_id: string;
  lender_id: string;
  remind_on: string;
  channel: ReminderChannel;
  message: string | null;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
  borrower?: Pick<Borrower, 'full_name' | 'avatar_initials'>;
}

export interface ActivityLog {
  id: string;
  lender_id: string;
  borrower_id: string | null;
  payment_id: string | null;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

export interface LenderPortfolio {
  lender_id: string;
  total_borrowers: number;
  total_loaned: number;
  total_outstanding: number;
  total_collected_principal: number;
  total_collected_interest: number;
  total_accrued_interest: number;
  active_count: number;
  overdue_count: number;
  settled_count: number;
  avg_interest_rate: number;
  collection_rate_pct: number;
}

export interface BorrowerFormValues {
  full_name: string;
  phone?: string;
  email?: string;
  notes?: string;
  total_borrowed: number;
  interest_rate: number;
  interest_type: InterestType;
  loan_date: string;
  due_date?: string;
  status: BorrowerStatus;
}

export interface PaymentFormValues {
  amount: number;
  payment_type: PaymentType;
  payment_date: string;
  method: PaymentMethod;
  reference_no?: string;
  notes?: string;
}

export interface ReminderFormValues {
  borrower_id: string;
  remind_on: string;
  channel: ReminderChannel;
  message?: string;
}
