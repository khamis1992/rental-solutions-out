
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Attachment {
  filename: string;
  content: string;
}

async function getAttachments(rule: any, recipient: any): Promise<Attachment[]> {
  const attachments: Attachment[] = [];

  try {
    // Handle contract PDF for contract confirmation
    if (rule.trigger_type === 'contract_confirmation') {
      const { data: agreement } = await supabase
        .from('leases')
        .select('processed_content, agreement_number')
        .eq('customer_id', recipient.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (agreement?.processed_content) {
        attachments.push({
          filename: `contract_${agreement.agreement_number}.pdf`,
          content: agreement.processed_content
        });
      }
    }

    // Handle payment schedule for payment reminders
    if (rule.trigger_type === 'payment_reminder') {
      const { data: payments } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('lease_id', recipient.current_lease_id)
        .gte('due_date', new Date().toISOString());

      if (payments?.length) {
        attachments.push({
          filename: 'payment_schedule.pdf',
          content: JSON.stringify(payments) // You'd want to format this properly
        });
      }
    }

    // Handle legal documents
    if (rule.trigger_type === 'legal_notice') {
      const { data: legalCase } = await supabase
        .from('legal_cases')
        .select('*')
        .eq('customer_id', recipient.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (legalCase) {
        attachments.push({
          filename: `legal_notice_${legalCase.id}.pdf`,
          content: JSON.stringify(legalCase) // You'd want to format this properly
        });
      }
    }

    return attachments;
  } catch (error) {
    console.error('Error getting attachments:', error);
    return [];
  }
}

async function processTemplate(template: any, recipient: any): Promise<string> {
  try {
    let content = template.content;

    // Replace customer variables
    content = content.replace(/\{\{customer\.([^}]+)\}\}/g, (match: string, field: string) => {
      return recipient[field] || '';
    });

    // Get and replace agreement variables
    const { data: agreement } = await supabase
      .from('leases')
      .select('*, vehicles(*)')
      .eq('customer_id', recipient.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (agreement) {
      content = content.replace(/\{\{agreement\.([^}]+)\}\}/g, (match: string, field: string) => {
        return agreement[field] || '';
      });

      // Replace vehicle variables
      content = content.replace(/\{\{vehicle\.([^}]+)\}\}/g, (match: string, field: string) => {
        return agreement.vehicles?.[field] || '';
      });
    }

    return content;
  } catch (error) {
    console.error('Error processing template:', error);
    return template.content;
  }
}

async function processAutomationRules() {
  try {
    // Get active automation rules
    const { data: rules, error: rulesError } = await supabase
      .from('email_automation_rules')
      .select(`
        *,
        email_templates (*)
      `)
      .eq('is_active', true);

    if (rulesError) throw rulesError;

    // Process each rule
    for (const rule of rules) {
      let recipientsQuery = supabase.from('profiles').select('*');
      const now = new Date();

      // Apply rule-specific conditions
      switch (rule.trigger_type) {
        case 'welcome':
          recipientsQuery = recipientsQuery
            .eq('role', 'customer')
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .is('welcome_email_sent', false);
          break;

        case 'contract_confirmation':
          const { data: newAgreements } = await supabase
            .from('leases')
            .select('customer_id')
            .eq('status', 'active')
            .is('confirmation_email_sent', false);

          if (newAgreements?.length) {
            recipientsQuery = recipientsQuery.in('id', newAgreements.map(a => a.customer_id));
          }
          break;

        case 'payment_reminder':
          if (rule.timing_type === 'before') {
            const reminderDate = new Date(now.getTime() + (rule.timing_value * 24 * 60 * 60 * 1000));
            const { data: upcomingPayments } = await supabase
              .from('payment_schedules')
              .select('lease_id')
              .eq('status', 'pending')
              .gte('due_date', now.toISOString())
              .lte('due_date', reminderDate.toISOString());

            if (upcomingPayments?.length) {
              const leaseIds = upcomingPayments.map(p => p.lease_id);
              recipientsQuery = recipientsQuery
                .in('id', supabase.from('leases').select('customer_id').in('id', leaseIds));
            }
          }
          break;

        case 'late_payment':
          const { data: overduePayments } = await supabase
            .from('payment_schedules')
            .select('lease_id')
            .eq('status', 'pending')
            .lt('due_date', now.toISOString());

          if (overduePayments?.length) {
            const leaseIds = overduePayments.map(p => p.lease_id);
            recipientsQuery = recipientsQuery
              .in('id', supabase.from('leases').select('customer_id').in('id', leaseIds));
          }
          break;

        case 'legal_notice':
          const { data: legalCases } = await supabase
            .from('legal_cases')
            .select('customer_id')
            .eq('status', 'pending_reminder');

          if (legalCases?.length) {
            recipientsQuery = recipientsQuery.in('id', legalCases.map(c => c.customer_id));
          }
          break;

        case 'insurance_renewal':
          const renewalDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
          const { data: expiringInsurance } = await supabase
            .from('vehicle_insurance')
            .select('vehicle_id')
            .lte('end_date', renewalDate.toISOString())
            .gt('end_date', now.toISOString());

          if (expiringInsurance?.length) {
            const vehicleIds = expiringInsurance.map(i => i.vehicle_id);
            recipientsQuery = recipientsQuery
              .in('id', supabase.from('leases').select('customer_id').in('vehicle_id', vehicleIds));
          }
          break;
      }

      // Get recipients based on conditions
      const { data: recipients, error: recipientsError } = await recipientsQuery;

      if (recipientsError) {
        console.error('Error getting recipients:', recipientsError);
        continue;
      }

      // Send emails to recipients
      for (const recipient of recipients || []) {
        try {
          // Check if we've already sent this notification recently
          const { data: recentLog } = await supabase
            .from('email_notification_logs')
            .select()
            .eq('rule_id', rule.id)
            .eq('recipient_id', recipient.id)
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .maybeSingle();

          if (recentLog) {
            console.log(`Skipping recent notification for recipient ${recipient.id}`);
            continue;
          }

          // Process template with variables
          const processedContent = await processTemplate(rule.email_templates, recipient);

          // Get attachments
          const attachments = await getAttachments(rule, recipient);

          // Send email using Resend
          const emailResponse = await resend.emails.send({
            from: "Rent Car System <onboarding@resend.dev>",
            to: recipient.email,
            subject: rule.email_templates?.subject || "Notification",
            html: processedContent,
            attachments: attachments
          });

          // Log the notification
          const { data: logEntry } = await supabase
            .from('email_notification_logs')
            .insert({
              rule_id: rule.id,
              template_id: rule.template_id,
              recipient_email: recipient.email,
              recipient_id: recipient.id,
              status: 'sent',
              attachments: attachments.map(a => ({ filename: a.filename })),
              metadata: {
                emailId: emailResponse.id,
                triggerType: rule.trigger_type,
                processedAt: new Date().toISOString()
              }
            })
            .select()
            .single();

          // Update status flags based on email type
          if (rule.trigger_type === 'welcome') {
            await supabase
              .from('profiles')
              .update({ welcome_email_sent: true })
              .eq('id', recipient.id);
          } else if (rule.trigger_type === 'contract_confirmation') {
            await supabase
              .from('leases')
              .update({ confirmation_email_sent: true })
              .eq('customer_id', recipient.id)
              .is('confirmation_email_sent', false);
          }

          console.log(`Sent email to ${recipient.email} for rule ${rule.name}`);
        } catch (error) {
          console.error(`Error sending email to ${recipient.email}:`, error);
          
          // Log the error
          await supabase
            .from('email_notification_logs')
            .insert({
              rule_id: rule.id,
              template_id: rule.template_id,
              recipient_email: recipient.email,
              recipient_id: recipient.id,
              status: 'failed',
              error_message: error.message
            });
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error processing automation rules:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await processAutomationRules();
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
