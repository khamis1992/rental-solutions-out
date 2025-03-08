
import { PaymentMethodType, mapLegacyPaymentMethod } from '@/types/payment.types';

/**
 * Formats a payment method for display
 */
export function formatPaymentMethod(method: string): string {
  // First map to standard type
  const standardMethod = mapLegacyPaymentMethod(method);
  
  // Then format for display
  switch (standardMethod) {
    case 'cash':
      return 'Cash';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'credit_card':
      return 'Credit Card';
    case 'debit_card':
      return 'Debit Card';
    case 'check':
      return 'Check';
    case 'paypal':
      return 'PayPal';
    case 'sadad':
      return 'SADAD';
    case 'other':
    default:
      return method || 'Other';
  }
}

/**
 * Get the standardized payment methods list
 */
export function getPaymentMethods(): Array<{value: PaymentMethodType, label: string}> {
  return [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'check', label: 'Check' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'sadad', label: 'SADAD' },
    { value: 'other', label: 'Other' }
  ];
}
