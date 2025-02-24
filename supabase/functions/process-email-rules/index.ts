
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

async function processAutomationRules() {
  try {
    // Get active automation rules
    const { data: rules, error: rulesError } = await supabase
      .from('email_automation_rules')
      .select(`
        *,
        email_templates (
          id,
          name,
          content,
          subject
        )
      `)
      .eq('is_active', true)

    if (rulesError) throw rulesError

    // Process each rule
    for (const rule of rules) {
      const now = new Date()
      let recipientsQuery = supabase.from('profiles').select('*')

      // Apply rule-specific conditions
      switch (rule.trigger_type) {
        case 'welcome':
          recipientsQuery = recipientsQuery
            .eq('role', 'customer')
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          break

        case 'payment_reminder':
          // Get customers with upcoming payments
          const { data: upcomingPayments } = await supabase
            .from('payment_schedules')
            .select('lease_id')
            .eq('status', 'pending')
            .gt('due_date', now.toISOString())
            .lte('due_date', new Date(now.getTime() + (rule.timing_value * 24 * 60 * 60 * 1000)).toISOString())

          if (upcomingPayments?.length) {
            const leaseIds = upcomingPayments.map(p => p.lease_id)
            recipientsQuery = recipientsQuery
              .in('id', supabase.from('leases').select('customer_id').in('id', leaseIds))
          }
          break

        case 'late_payment':
          const { data: overduePayments } = await supabase
            .from('payment_schedules')
            .select('lease_id')
            .eq('status', 'pending')
            .lt('due_date', now.toISOString())

          if (overduePayments?.length) {
            const leaseIds = overduePayments.map(p => p.lease_id)
            recipientsQuery = recipientsQuery
              .in('id', supabase.from('leases').select('customer_id').in('id', leaseIds))
          }
          break

        // Add other cases as needed
      }

      // Get recipients based on conditions
      const { data: recipients, error: recipientsError } = await recipientsQuery

      if (recipientsError) {
        console.error('Error getting recipients:', recipientsError)
        continue
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
            .maybeSingle()

          if (recentLog) {
            console.log(`Skipping recent notification for recipient ${recipient.id}`)
            continue
          }

          // Send email using Resend
          const emailResponse = await resend.emails.send({
            from: "Rent Car System <onboarding@resend.dev>",
            to: recipient.email,
            subject: rule.email_templates?.subject || "Notification",
            html: rule.email_templates?.content || "",
          })

          // Log the notification
          await supabase
            .from('email_notification_logs')
            .insert({
              rule_id: rule.id,
              template_id: rule.template_id,
              recipient_email: recipient.email,
              recipient_id: recipient.id,
              status: 'sent',
              metadata: {
                emailId: emailResponse.id,
                triggerType: rule.trigger_type
              }
            })

          console.log(`Sent email to ${recipient.email} for rule ${rule.name}`)
        } catch (error) {
          console.error(`Error sending email to ${recipient.email}:`, error)
          
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
            })
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error processing automation rules:', error)
    return { success: false, error: error.message }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const result = await processAutomationRules()
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
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
    )
  }
})
