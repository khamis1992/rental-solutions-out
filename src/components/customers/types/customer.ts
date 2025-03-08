
export interface Customer {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  driver_license: string | null;
  id_document_url: string | null;
  license_document_url: string | null;
  contract_document_url: string | null;
  created_at: string;
  role: 'customer' | 'staff' | 'admin';
  status?: 'active' | 'inactive' | 'pending_review' | 'blacklisted' | 'suspended';
  document_verification_status?: 'pending' | 'verified' | 'rejected' | 'expired';
  profile_completion_score?: number;
  merged_into?: string | null;
  nationality?: string | null;
  id_document_expiry?: string | null;
  license_document_expiry?: string | null;
}

export interface CustomerWithRelations extends Customer {
  agreements?: Array<{
    id: string;
    agreement_number: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
  }>;
}

export type CustomerFormData = Omit<Customer, 'id' | 'created_at' | 'role'>;

export interface CustomerSearchResult {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  similarity?: number;
}

export interface CustomerStatsData {
  totalCustomers: number;
  activeCustomers: number;
  pendingCustomers: number;
  newCustomersThisMonth: number;
  customersByStatus: Record<string, number>;
}

export interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  nationality: string | null;
  driver_license: string | null;
  id_document_expiry?: string | null;
  license_document_expiry?: string | null;
  status?: 'active' | 'inactive' | 'pending_review' | 'blacklisted' | 'suspended';
  document_verification_status?: 'pending' | 'verified' | 'rejected' | 'expired';
}

export interface ProfileManagementProps {
  customerId: string;
  className?: string;
}
