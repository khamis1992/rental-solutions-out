
import { Json } from "../json.types";

export type EmailTriggerType = 
  | "welcome" 
  | "contract_confirmation" 
  | "payment_reminder" 
  | "late_payment" 
  | "insurance_renewal" 
  | "legal_notice";

export type TimingType = "on" | "before" | "after";
export type RecurrenceType = "once" | "daily" | "weekly";

export interface EmailTemplate {
  id: string;
  name: string;
  content?: string;
  subject?: string;
  is_active?: boolean;
}

export interface AutomationRule {
  id?: string;
  name: string;
  description?: string;
  template_id: string;
  trigger_type: EmailTriggerType;
  timing_type: TimingType;
  timing_value?: number;
  conditions?: Json;
  is_active: boolean;
  recurrence?: RecurrenceType;
  created_at?: string;
  updated_at?: string;
  email_templates?: EmailTemplate;
}

// The incoming database type that needs to be converted
export interface DatabaseAutomationRule {
  id?: string;
  name?: string;
  description?: string;
  template_id: string;
  trigger_type?: EmailTriggerType;
  timing_type?: TimingType;
  timing_value?: number;
  conditions?: Json;
  is_active?: boolean;
  recurrence?: RecurrenceType;
  created_at: string;
  updated_at: string;
  email_templates?: EmailTemplate;
}

// Create a helper function to convert database response to the proper type
export function convertToAutomationRule(data: DatabaseAutomationRule): AutomationRule {
  return {
    id: data.id,
    name: data.name || 'Unnamed Rule',
    description: data.description,
    template_id: data.template_id,
    trigger_type: data.trigger_type || 'welcome',
    timing_type: data.timing_type || 'on',
    timing_value: data.timing_value,
    conditions: data.conditions,
    is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
    recurrence: data.recurrence,
    created_at: data.created_at,
    updated_at: data.updated_at,
    email_templates: data.email_templates
  };
}

// Create a helper to process an array of database rules
export function processAutomationRules(data: DatabaseAutomationRule[]): AutomationRule[] {
  return data.map(convertToAutomationRule);
}
