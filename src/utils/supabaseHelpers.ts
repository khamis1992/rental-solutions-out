
import { supabase } from "@/integrations/supabase/client";
import { CUSTOM_TABLES, CustomTable } from "@/types/database/common.types";
import { formatDateToISO } from "@/lib/formHelpers";

/**
 * Generic query function for custom tables
 * Handles the error: "Argument of type 'string' is not assignable to parameter"
 */
export async function queryCustomTable<T = any>(tableName: CustomTable | string): Promise<T[]> {
  try {
    // Type assertion to bypass TypeScript restriction
    const { data, error } = await supabase
      .from(tableName as any)
      .select();
    
    if (error) throw error;
    return (data || []) as T[];
  } catch (error) {
    console.error(`Error querying custom table ${tableName}:`, error);
    return [];
  }
}

/**
 * Safely inserts automation rules with correct types
 * This fixes: "Argument of type ... is not assignable to parameter of type ..."
 */
export async function insertAutomationRule(ruleData: {
  name: string;
  description?: string;
  template_id: string;
  trigger_type: string; 
  timing_type: string;
  timing_value?: number;
  conditions?: any;
  is_active: boolean;
  recurrence?: string;
}) {
  try {
    // Standardize the data format for insertion
    const formattedRule = {
      name: ruleData.name,
      description: ruleData.description || '',
      template_id: ruleData.template_id,
      trigger_type: ruleData.trigger_type,
      timing_type: ruleData.timing_type,
      timing_value: ruleData.timing_value || 0,
      conditions: ruleData.conditions || {},
      is_active: ruleData.is_active,
      recurrence: ruleData.recurrence || 'once'
    };

    // Insert with type assertion
    const { data, error } = await supabase
      .from('email_automation_rules' as any)
      .insert(formattedRule);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error inserting automation rule:", error);
    throw error;
  }
}

/**
 * Helper for customer reward creation with proper date handling
 */
export async function createCustomerReward(data: {
  customer_id: string;
  reward_id: string;
  status?: string;
  expiry_date?: Date | string;
}) {
  try {
    const rewardData = {
      customer_id: data.customer_id,
      reward_id: data.reward_id,
      status: data.status || 'active',
      expiry_date: formatDateToISO(data.expiry_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
    };

    const { error } = await supabase
      .from('customer_rewards')
      .insert(rewardData);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating customer reward:", error);
    return false;
  }
}

/**
 * Insert log call with proper type handling
 * This fixes the argument of type error
 */
export async function insertCallLog(data: {
  duration: number;
  status?: 'completed' | 'scheduled' | 'missed';
  type?: 'incoming' | 'outgoing';
  notes?: string;
  scheduled_for?: string;
  lead_id: string;
  follow_up_needed?: boolean;
  follow_up_date?: string;
  performed_by?: string;
}) {
  try {
    const callLogData = {
      duration: data.duration,
      status: data.status || 'completed',
      type: data.type || 'outgoing',
      notes: data.notes || null,
      scheduled_for: data.scheduled_for || null,
      lead_id: data.lead_id,
      follow_up_needed: data.follow_up_needed || false,
      follow_up_date: data.follow_up_date || null,
      performed_by: data.performed_by || null
    };

    const { error } = await supabase
      .from('call_logs')
      .insert(callLogData);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error inserting call log:", error);
    return false;
  }
}
