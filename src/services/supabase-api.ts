
import { supabase } from "@/integrations/supabase/client";
import type { SalesLead } from "@/types/sales-lead";
import type { Customer } from "@/types/database/customer.types";

/**
 * Leads Management
 */
export async function getLeads() {
  const { data, error } = await supabase
    .from("sales_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as SalesLead[];
}

export async function getLeadById(id: string) {
  const { data, error } = await supabase
    .from("sales_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as SalesLead;
}

export async function createLead(lead: Omit<SalesLead, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("sales_leads")
    .insert([lead])
    .select()
    .single();

  if (error) throw error;
  return data as SalesLead;
}

export async function updateLead(id: string, lead: Partial<SalesLead>) {
  const { data, error } = await supabase
    .from("sales_leads")
    .update(lead)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as SalesLead;
}

export async function deleteLead(id: string) {
  const { error } = await supabase
    .from("sales_leads")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Customers Management
 */
export async function getCustomers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Customer[];
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "customer")
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function createCustomer(customer: Omit<Customer, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([{ ...customer, role: "customer" }])
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(id: string, customer: Partial<Customer>) {
  const { data, error } = await supabase
    .from("profiles")
    .update(customer)
    .eq("id", id)
    .eq("role", "customer")
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function deleteCustomer(id: string) {
  // First check if customer can be deleted
  const { data: canDelete, error: checkError } = await supabase
    .rpc("can_delete_customer", { customer_id: id });

  if (checkError) throw checkError;
  if (!canDelete) {
    throw new Error("Cannot delete customer with active leases");
  }

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id)
    .eq("role", "customer");

  if (error) throw error;
}

/**
 * Search functionality
 */
export async function searchCustomers(query: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .or(`full_name.ilike.%${query}%,phone_number.ilike.%${query}%,email.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Customer[];
}

export async function searchLeads(query: string) {
  const { data, error } = await supabase
    .from("sales_leads")
    .select("*")
    .or(`full_name.ilike.%${query}%,phone_number.ilike.%${query}%,email.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as SalesLead[];
}
