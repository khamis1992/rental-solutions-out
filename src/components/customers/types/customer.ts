
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
