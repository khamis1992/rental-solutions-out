
// Define the standard payment method types
export type PaymentMethodType = 
  'cash' | 
  'bank_transfer' | 
  'credit_card' | 
  'debit_card' | 
  'check' | 
  'paypal' | 
  'sadad' | 
  'other';

// Define payment status types
export type PaymentStatus = 
  'pending' | 
  'completed' | 
  'failed' | 
  'refunded' | 
  'partially_paid';

// Define payment input form data
export interface PaymentFormData {
  amount: number;
  paymentMethod: PaymentMethodType;
  description?: string;
  paymentDate?: Date;
}

// Map legacy payment method types to new standard types
export const mapLegacyPaymentMethod = (method: string): PaymentMethodType => {
  const methodMap: Record<string, PaymentMethodType> = {
    'Cash': 'cash',
    'WireTransfer': 'bank_transfer',
    'Invoice': 'other',
    'Cheque': 'check',
    'Deposit': 'bank_transfer',
    'On_hold': 'other'
  };
  
  return methodMap[method] || 'other';
};
