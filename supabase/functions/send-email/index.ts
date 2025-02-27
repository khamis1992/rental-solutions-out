
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("FROM_EMAIL") || "info@alaraf.online";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get config settings from environment or config.toml
const MAX_RETRIES = parseInt(Deno.env.get('MAX_RETRIES') || '5');
const BASE_RETRY_DELAY_MS = parseInt(Deno.env.get('BASE_RETRY_DELAY_MS') || '200');
const MAX_RETRY_DELAY_MS = parseInt(Deno.env.get('MAX_RETRY_DELAY_MS') || '30000');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

interface EmailRequest {
  templateId: string;
  recipientEmail: string;
  recipientName: string;
  variables: Record<string, any>;
  scheduledFor?: string; // ISO datetime string for scheduled sending
  segment?: {
    filters: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }>;
  };
  category?: string;
  priority?: 'high' | 'normal' | 'low';
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if recipient has opted out
async function hasOptedOut(email: string): Promise<boolean> {
  const { data } = await supabase
    .from('email_opt_outs')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  
  return !!data;
}

// Check if email should be sent based on preferred send time
function shouldDelayForPreferredTime(priority: string = 'normal'): { delay: boolean; scheduledTime: Date | null } {
  // Only delay non-high priority emails
  if (priority === 'high') {
    return { delay: false, scheduledTime: null };
  }
  
  // Get current time
  const now = new Date();
  
  // Get system settings (this would be cached in a real implementation)
  // For now we'll use a hard-coded value of 9am
  const preferredHour = 9;
  const preferredMinute = 0;
  
  // Create preferred time for today
  const preferredTime = new Date();
  preferredTime.setHours(preferredHour, preferredMinute, 0, 0);
  
  // If current time is after preferred time, schedule for tomorrow
  if (now > preferredTime) {
    preferredTime.setDate(preferredTime.getDate() + 1);
  }
  
  // Only delay if the system setting is enabled
  // For simplicity, we're checking a hard-coded value
  const usePreferredTime = true;
  
  return {
    delay: usePreferredTime,
    scheduledTime: usePreferredTime ? preferredTime : null
  };
}

// Validate template variables
function validateTemplateVariables(template: any, variables: Record<string, any>): string[] {
  const missingVariables: string[] = [];
  
  if (!template || !template.variable_mappings) {
    return missingVariables;
  }
  
  // Extract required variables from template
  const requiredVars: string[] = [];
  const variableMappings = template.variable_mappings;
  
  // Find all {{variable}} patterns in the content
  const matches = template.content.match(/\{\{([^}]+)\}\}/g) || [];
  
  for (const match of matches) {
    // Extract just the variable name without braces
    const varName = match.replace(/\{\{|\}\}/g, '').trim();
    requiredVars.push(varName);
  }
  
  // Check if all required variables are provided
  for (const varName of requiredVars) {
    if (varName.includes('.')) {
      const [category, field] = varName.split('.');
      if (!variables[category] || variables[category][field] === undefined) {
        missingVariables.push(varName);
      }
    } else {
      // Handle flat variables
      if (variables[varName] === undefined) {
        missingVariables.push(varName);
      }
    }
  }
  
  return missingVariables;
}

// Process email templates with advanced variable handling
function processTemplate(templateContent: string, variables: Record<string, any>): string {
  let processedContent = templateContent;
  
  // Replace nested variables (e.g., {{customer.full_name}})
  for (const category in variables) {
    for (const [key, value] of Object.entries(variables[category] || {})) {
      const regex = new RegExp(`\\{\\{${category}\\.${key}\\}\\}`, 'g');
      processedContent = processedContent.replace(regex, value?.toString() || '');
    }
  }
  
  // Replace flat variables (e.g., {{date}})
  for (const [key, value] of Object.entries(variables || {})) {
    if (typeof value !== 'object') {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processedContent = processedContent.replace(regex, value?.toString() || '');
    }
  }
  
  // Add standard variables
  const date = new Date();
  processedContent = processedContent
    .replace(/\{\{date\}\}/g, date.toLocaleDateString('ar-AE'))
    .replace(/\{\{time\}\}/g, date.toLocaleTimeString('ar-AE'))
    .replace(/\{\{year\}\}/g, date.getFullYear().toString());
  
  // Handle any remaining variables with empty string
  processedContent = processedContent.replace(/\{\{[^}]+\}\}/g, '');
  
  return processedContent;
}

// Process recipient segmentation
async function getSegmentedRecipients(segment: any): Promise<string[]> {
  if (!segment || !segment.filters || segment.filters.length === 0) {
    return [];
  }
  
  let query = supabase.from('profiles').select('email');
  
  // Apply each filter to the query
  for (const filter of segment.filters) {
    const { field, operator, value } = filter;
    
    switch (operator) {
      case 'equals':
        query = query.eq(field, value);
        break;
      case 'contains':
        query = query.ilike(field, `%${value}%`);
        break;
      case 'greater_than':
        query = query.gt(field, value);
        break;
      case 'less_than':
        query = query.lt(field, value);
        break;
    }
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    console.error('Error fetching segmented recipients:', error);
    return [];
  }
  
  return data.map(record => record.email);
}

// Queue an email for later sending
async function queueEmail(templateId: string, recipientEmail: string, recipientName: string, variables: any, scheduledTime: Date): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('email_notification_queue')
      .insert({
        template_id: templateId,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        scheduled_for: scheduledTime.toISOString(),
        metadata: {
          variables,
          created_at: new Date().toISOString()
        },
        status: 'pending'
      });
      
    if (error) {
      console.error('Error queuing email:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception queuing email:', err);
    return false;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!resend) {
      throw new Error('Resend API key not configured');
    }

    const { 
      templateId, 
      recipientEmail, 
      recipientName, 
      variables,
      scheduledFor,
      segment,
      category = 'general',
      priority = 'normal'
    } = await req.json() as EmailRequest;

    // Validate required fields
    if (!templateId) {
      return new Response(
        JSON.stringify({ error: 'Missing template ID' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Process segmentation if provided
    let recipients: string[] = [];
    if (segment && segment.filters && segment.filters.length > 0) {
      recipients = await getSegmentedRecipients(segment);
      if (recipients.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No recipients match the provided segment filters' }),
          { status: 400, headers: corsHeaders }
        );
      }
    } else if (recipientEmail) {
      recipients = [recipientEmail];
    } else {
      return new Response(
        JSON.stringify({ error: 'Missing recipient email or valid segment' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .maybeSingle();

    if (templateError || !template) {
      console.error('Template fetch error:', templateError);
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Validate template variables
    const missingVariables = validateTemplateVariables(template, variables);
    if (missingVariables.length > 0) {
      console.warn('Missing template variables:', missingVariables);
      // Continue but log warning
    }

    // Process template content with variables
    const processedContent = processTemplate(template.content, variables);

    // Check preferred send time
    const { delay, scheduledTime } = shouldDelayForPreferredTime(priority);
    const useScheduledTime = scheduledFor ? new Date(scheduledFor) : (delay ? scheduledTime : null);

    // If we need to schedule this for later, queue it
    if (useScheduledTime && useScheduledTime > new Date()) {
      const queueResults = [];
      
      for (const email of recipients) {
        // Validate email format
        if (!isValidEmail(email)) {
          console.warn(`Skipping invalid email format: ${email}`);
          continue;
        }
        
        // Check if user has opted out
        const optedOut = await hasOptedOut(email);
        if (optedOut) {
          console.log(`Skipping email to ${email} - user has opted out`);
          continue;
        }
        
        const queued = await queueEmail(
          templateId, 
          email, 
          recipientName || email.split('@')[0], 
          variables, 
          useScheduledTime
        );
        
        queueResults.push({ email, queued });
      }
      
      return new Response(
        JSON.stringify({ 
          scheduled: true, 
          scheduledTime: useScheduledTime.toISOString(),
          results: queueResults
        }),
        { headers: corsHeaders }
      );
    }

    // Send emails immediately
    const sendResults = [];
    
    for (const email of recipients) {
      try {
        // Validate email format
        if (!isValidEmail(email)) {
          sendResults.push({ email, success: false, reason: 'invalid_email_format' });
          continue;
        }
        
        // Check if user has opted out
        const optedOut = await hasOptedOut(email);
        if (optedOut) {
          sendResults.push({ email, success: false, reason: 'recipient_opted_out' });
          continue;
        }
        
        // Send email using Resend
        const emailResponse = await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: template.subject || 'No Subject',
          html: processedContent,
          categories: [category]
        });
        
        // Log the email sending
        await supabase
          .from('email_notification_logs')
          .insert({
            template_id: templateId,
            recipient_email: email,
            status: 'sent',
            message_id: emailResponse.id,
            metadata: {
              variables,
              processed_content: processedContent,
              category
            },
          });
          
        sendResults.push({ email, success: true, id: emailResponse.id });
        
        // Update metrics
        await supabase.rpc('increment_email_metric', {
          p_metric_type: 'successful_sent',
          p_count: 1
        });
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        
        sendResults.push({ 
          email, 
          success: false, 
          reason: error instanceof Error ? error.message : 'unknown_error'
        });
        
        // Update failure metrics
        if (error.message?.includes('rate limit')) {
          await supabase.rpc('increment_email_metric', {
            p_metric_type: 'rate_limited_count',
            p_count: 1
          });
        } else {
          await supabase.rpc('increment_email_metric', {
            p_metric_type: 'failed_sent',
            p_count: 1
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: sendResults.some(r => r.success), 
        results: sendResults
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error processing email request:', error);
    
    // Update total failure metrics
    await supabase.rpc('increment_email_metric', {
      p_metric_type: 'failed_sent',
      p_count: 1
    });

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
