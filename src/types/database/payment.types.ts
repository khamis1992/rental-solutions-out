
export interface PaymentHistoryView {
  id: string;
  lease_id?: string;
  customer_id?: string;
  amount: number;
  amount_paid?: number;
  balance?: number;
  actual_payment_date?: string | null;
  original_due_date?: string | null;
  late_fine_amount?: number;
  days_overdue?: number;
  status?: string;
  payment_method?: string;
  description?: string;
  type?: string;
  agreement_number?: string;
}

export interface PaymentView {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid?: number;
  payment_date?: string;
  payment_method?: string;
  status?: string;
  description?: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
}
