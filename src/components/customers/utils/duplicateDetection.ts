
import { supabase } from "@/integrations/supabase/client";
import type { Customer } from "../types/customer";

export interface DuplicateMatch {
  id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  similarity: number;
  match_reason: string[];
}

export async function findPotentialDuplicates(
  customer: Partial<Customer>
): Promise<DuplicateMatch[]> {
  if (!customer.full_name && !customer.phone_number && !customer.email) {
    return [];
  }

  // First try exact phone number match
  if (customer.phone_number) {
    const { data: phoneMatches } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, email')
      .eq('phone_number', customer.phone_number)
      .neq('id', customer.id || '')
      .limit(5);

    if (phoneMatches && phoneMatches.length > 0) {
      return phoneMatches.map(match => ({
        ...match,
        similarity: 1,
        match_reason: ['Exact phone number match']
      }));
    }
  }

  // Then try fuzzy name matching
  if (customer.full_name) {
    const { data: nameMatches } = await supabase
      .rpc('fuzzy_name_match', {
        search_name: customer.full_name
      });

    if (nameMatches) {
      return nameMatches.map(match => ({
        ...match,
        similarity: match.similarity,
        match_reason: ['Similar name']
      }));
    }
  }

  // Finally try email match
  if (customer.email) {
    const { data: emailMatches } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, email')
      .eq('email', customer.email)
      .neq('id', customer.id || '')
      .limit(5);

    if (emailMatches && emailMatches.length > 0) {
      return emailMatches.map(match => ({
        ...match,
        similarity: 1,
        match_reason: ['Exact email match']
      }));
    }
  }

  return [];
}
