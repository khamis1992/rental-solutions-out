
export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'pending_review' | 'blacklisted' | 'merged';

export type DocumentVerificationStatus = 'pending' | 'rejected' | 'verified' | 'expired';

export interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  nationality?: string | null;
  driver_license: string | null;
  id_document_url: string | null;
  license_document_url: string | null;
  contract_document_url: string | null;
  created_at: string;
  updated_at: string;
  role: 'customer' | 'staff' | 'admin';
  status: CustomerStatus;
  document_verification_status: DocumentVerificationStatus;
  profile_completion_score?: number;
  is_ai_generated?: boolean;
}

export interface CustomerDetails {
  full_name: string;
  phone_number: string;
}

// Define the interface expected by the SearchResults component
export interface SearchResultCustomer {
  id: string;
  full_name: string;
  phone_number?: string | null;
  email?: string | null;
  type: 'customer';
}
