
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get pending reminders
    const { data: reminders, error: remindersError } = await supabase
      .from('payment_reminders')
      .select(`
        *,
        unified_payments (
          amount,
          payment_date,
          description
        ),
        leases (
          agreement_number,
          customer_id,
          profiles:customer_id (
            full_name,
            email,
            phone_number
          )
        )
      `)
      .eq('status', 'pending')
      .is('sent_at', null)

    if (remindersError) throw remindersError

    console.log(`Processing ${reminders?.length || 0} pending reminders`)

    for (const reminder of reminders || []) {
      try {
        const customer = reminder.leases?.profiles
        if (!customer?.email) continue

        const daysText = reminder.reminder_type === 'after_due' 
          ? 'overdue'
          : reminder.reminder_type === 'on_due'
            ? 'due today'
            : `due in ${reminder.days_offset} days`

        const emailResponse = await resend.emails.send({
          from: "CarRental Reminders <reminders@your-domain.com>",
          to: [customer.email],
          subject: `Payment Reminder - ${daysText}`,
          html: `
            <h2>Payment Reminder</h2>
            <p>Dear ${customer.full_name},</p>
            <p>This is a reminder about your upcoming payment:</p>
            <ul>
              <li>Agreement: ${reminder.leases?.agreement_number}</li>
              <li>Amount: QAR ${reminder.unified_payments?.amount}</li>
              <li>Due Date: ${new Date(reminder.unified_payments?.payment_date).toLocaleDateString()}</li>
              <li>Status: ${daysText}</li>
            </ul>
            <p>Please ensure timely payment to avoid any late fees.</p>
            <p>Thank you for your business!</p>
          `
        })

        // Update reminder status
        const { error: updateError } = await supabase
          .from('payment_reminders')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', reminder.id)

        if (updateError) throw updateError

        console.log(`Reminder sent successfully for agreement ${reminder.leases?.agreement_number}`)
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        
        // Update reminder status to failed
        await supabase
          .from('payment_reminders')
          .update({
            status: 'failed'
          })
          .eq('id', reminder.id)
      }
    }

    return new Response(
      JSON.stringify({ message: 'Reminders processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in send-payment-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
