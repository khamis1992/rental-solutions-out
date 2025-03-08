
import { Customer, CustomerWithRelations } from "@/components/customers/types/customer";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { Agreement } from "@/types/agreement.types";

/**
 * Transform a database profile record to a Customer
 */
export function transformDbProfileToCustomer(dbProfile: any): Customer {
  return {
    id: dbProfile.id,
    full_name: dbProfile.full_name,
    phone_number: dbProfile.phone_number,
    email: dbProfile.email,
    address: dbProfile.address,
    driver_license: dbProfile.driver_license,
    id_document_url: dbProfile.id_document_url,
    license_document_url: dbProfile.license_document_url,
    contract_document_url: dbProfile.contract_document_url,
    created_at: dbProfile.created_at,
    role: dbProfile.role as Customer['role'],
    status: dbProfile.status as Customer['status'],
    document_verification_status: dbProfile.document_verification_status as Customer['document_verification_status'],
    profile_completion_score: dbProfile.profile_completion_score,
    merged_into: dbProfile.merged_into,
    nationality: dbProfile.nationality,
    id_document_expiry: dbProfile.id_document_expiry,
    license_document_expiry: dbProfile.license_document_expiry
  };
}

/**
 * Transform a database vehicle record to a Vehicle
 */
export function transformDbVehicleToVehicle(dbVehicle: any): Vehicle {
  return {
    id: dbVehicle.id,
    make: dbVehicle.make,
    model: dbVehicle.model,
    year: dbVehicle.year,
    license_plate: dbVehicle.license_plate,
    color: dbVehicle.color,
    vin: dbVehicle.vin,
    status: dbVehicle.status as VehicleStatus,
    mileage: dbVehicle.mileage,
    location: dbVehicle.location,
    daily_rate: dbVehicle.daily_rate,
    monthly_rate: dbVehicle.monthly_rate,
    created_at: dbVehicle.created_at,
    updated_at: dbVehicle.updated_at
  };
}

/**
 * Transform a database lease record to an Agreement
 */
export function transformDbLeaseToAgreement(dbLease: any): Agreement {
  // Create a customer object from the nested customer data
  let customer = null;
  if (dbLease.customer && !dbLease.customer.error) {
    customer = {
      id: dbLease.customer.id,
      full_name: dbLease.customer.full_name,
      phone_number: dbLease.customer.phone_number,
      email: dbLease.customer.email,
      address: dbLease.customer.address,
      nationality: dbLease.customer.nationality,
      driver_license: dbLease.customer.driver_license
    };
  }

  // Create a vehicle object from the nested vehicle data
  let vehicle = null;
  if (dbLease.vehicle && !dbLease.vehicle.error) {
    vehicle = {
      id: dbLease.vehicle.id,
      make: dbLease.vehicle.make,
      model: dbLease.vehicle.model,
      year: dbLease.vehicle.year,
      license_plate: dbLease.vehicle.license_plate,
      color: dbLease.vehicle.color,
      vin: dbLease.vehicle.vin
    };
  }

  // Create the agreement object
  return {
    id: dbLease.id,
    agreement_number: dbLease.agreement_number,
    agreement_type: dbLease.agreement_type,
    customer_id: dbLease.customer_id,
    vehicle_id: dbLease.vehicle_id,
    start_date: dbLease.start_date,
    end_date: dbLease.end_date,
    status: dbLease.status,
    total_amount: dbLease.total_amount,
    initial_mileage: dbLease.initial_mileage || 0,
    return_mileage: dbLease.return_mileage,
    notes: dbLease.notes,
    created_at: dbLease.created_at,
    updated_at: dbLease.updated_at,
    rent_amount: dbLease.rent_amount,
    remaining_amount: dbLease.remaining_amount,
    daily_late_fee: dbLease.daily_late_fee,
    payment_status: dbLease.payment_status,
    last_payment_date: dbLease.last_payment_date,
    next_payment_date: dbLease.next_payment_date,
    payment_frequency: dbLease.payment_frequency,
    template_id: dbLease.template_id,
    customer: customer,
    vehicle: vehicle,
    remaining_amounts: dbLease.remaining_amounts
  };
}

/**
 * Map payment method types from database to frontend
 */
export function mapPaymentMethodType(dbPaymentMethod: string): string {
  const methodMap: Record<string, string> = {
    'Cash': 'cash',
    'Invoice': 'other',
    'WireTransfer': 'bank_transfer',
    'Cheque': 'cheque',
    'Deposit': 'deposit',
    'On_hold': 'other'
  };
  
  return methodMap[dbPaymentMethod] || dbPaymentMethod.toLowerCase();
}
