
export interface Customer {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  nationality: string | null;
  created_at: string;
  updated_at: string;
  driver_license: string | null;
  id_document_url: string | null;
  license_document_url: string | null;
  contract_document_url: string | null;
  status: CustomerStatus;
  role: UserRole;
}

export type CustomerStatus = 
  | "pending_review"
  | "active"
  | "suspended"
  | "blocked"
  | "incomplete";

export type UserRole = "customer" | "staff" | "admin";

export interface LeadScore {
  id: string;
  lead_score: number;
  full_name: string;
  status: LeadStatus;
}

export type LeadStatus =
  | "new"
  | "document_collection"
  | "vehicle_selection"
  | "agreement_draft"
  | "ready_for_signature"
  | "onboarding"
  | "completed"
  | "cancelled";
