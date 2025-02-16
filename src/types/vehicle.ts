
import { Database } from "@/integrations/supabase/types";

export type VehicleStatus = Database['public']['Enums']['vehicle_status'];
export type VehicleSize = 'compact' | 'mid_size' | 'full_size' | 'suv' | 'van' | 'luxury';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  license_plate: string;
  vin: string;
  status: VehicleStatus;
  mileage: number | null;
  image_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  location: string | null;
  insurance_company: string | null;
  is_test_data?: boolean;
  vehicle_type_id?: string;
}

export interface VehicleType {
  id: string;
  name: string;
  size: VehicleSize;
  daily_rate: number;
  weekly_rate: number | null;
  monthly_rate: number | null;
  description: string | null;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleTableItem extends Vehicle {
  selected?: boolean;
}

export interface VehicleFilterParams {
  status?: VehicleStatus;
  make?: string;
  model?: string;
  year?: number;
  searchQuery?: string;
}
