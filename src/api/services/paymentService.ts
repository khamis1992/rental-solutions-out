
import ApiService, { PaginationParams, FilterParams, ApiResponse, PaginatedResponse } from "./apiService";
import { PaymentImportData } from "@/components/finance/transactions/types/payment.types";

// Define the Payment interface
export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  balance: number;
  payment_date: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description?: string;
  type?: string;
  late_fine_amount?: number;
  days_overdue?: number;
  original_due_date?: string;
  created_at: string;
}

class PaymentService extends ApiService {
  // Get a paginated list of payments
  async getPayments(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    return this.get<Payment>("unified_payments", pagination, filters);
  }

  // Get a single payment by ID
  async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    return this.getById<Payment>("unified_payments", id);
  }

  // Create a new payment
  async createPayment(payment: Omit<Payment, "id" | "created_at">): Promise<ApiResponse<Payment>> {
    return this.post<Omit<Payment, "id" | "created_at">, Payment>("unified_payments", payment);
  }

  // Update an existing payment
  async updatePayment(id: string, payment: Partial<Payment>): Promise<ApiResponse<Payment>> {
    return this.put<Partial<Payment>, Payment>("unified_payments", id, payment);
  }

  // Delete a payment
  async deletePayment(id: string): Promise<ApiResponse<null>> {
    return this.delete("unified_payments", id);
  }

  // Get payments for a specific agreement
  async getAgreementPayments(
    agreementId: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    return this.get<Payment>("unified_payments", pagination, {
      ...filters,
      lease_id: agreementId
    });
  }

  // Record a payment with late fee
  async recordPaymentWithLateFee(
    params: {
      lease_id: string;
      amount: number;
      amount_paid: number;
      balance: number;
      payment_method: string;
      description?: string;
      payment_date: string;
      late_fine_amount?: number;
      days_overdue?: number;
      original_due_date: string;
      existing_late_fee_id?: string;
    }
  ): Promise<ApiResponse<Payment>> {
    return this.callFunction<typeof params, Payment>(
      "record-payment-with-late-fee",
      params
    );
  }

  // Import payments in bulk
  async importPayments(
    payments: PaymentImportData[]
  ): Promise<ApiResponse<{ processed: number, failed: number, details: any[] }>> {
    return this.callFunction<{ payments: PaymentImportData[] }, { processed: number, failed: number, details: any[] }>(
      "process-payment-import",
      { payments }
    );
  }

  // Analyze payment data before import
  async analyzePaymentImport(
    data: any
  ): Promise<ApiResponse<{ success: boolean, totalRows: number, validRows: number, issues?: string[] }>> {
    return this.callFunction<{ data: any }, { success: boolean, totalRows: number, validRows: number, issues?: string[] }>(
      "analyze-payment-import",
      { data }
    );
  }
}

export default new PaymentService();
