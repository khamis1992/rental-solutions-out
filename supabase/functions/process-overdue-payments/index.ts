
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting overdue payments processing...')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the first day of current month
    const today = new Date()
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const daysElapsed = today.getDate() - 1 // Days since the 1st (excluding today)
    
    console.log(`Processing for ${today.toISOString()}, days elapsed: ${daysElapsed}`)
    
    if (daysElapsed <= 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No late fees to process yet this month' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all active leases that haven't made a payment this month
    const { data: activeLeases, error: leaseError } = await supabase
      .from('leases')
      .select(`
        id,
        agreement_number,
        customer_id,
        rent_amount,
        daily_late_fee
      `)
      .eq('status', 'active')

    if (leaseError) throw leaseError

    console.log(`Found ${activeLeases?.length || 0} active leases`)

    // For each lease, check if a payment exists for this month
    let processedCount = 0
    const processResults = []

    for (const lease of activeLeases || []) {
      // Check if a payment already exists for this month
      const { data: existingPayments, error: paymentError } = await supabase
        .from('unified_payments')
        .select('id')
        .eq('lease_id', lease.id)
        .gte('payment_date', firstOfMonth.toISOString())
        .lt('payment_date', new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString())

      if (paymentError) {
        console.error(`Error checking payments for lease ${lease.id}:`, paymentError)
        continue
      }

      // Check if a late fee record already exists for this month
      const { data: existingLateFees, error: lateFeeError } = await supabase
        .from('unified_payments')
        .select('id')
        .eq('lease_id', lease.id)
        .eq('type', 'LATE_PAYMENT_FEE')
        .eq('original_due_date', firstOfMonth.toISOString())

      if (lateFeeError) {
        console.error(`Error checking late fees for lease ${lease.id}:`, lateFeeError)
        continue
      }

      // If no payment exists for this month and no late fee record exists yet
      if (existingPayments?.length === 0 && existingLateFees?.length === 0) {
        // Calculate late fee (days elapsed * daily rate)
        const dailyLateFee = lease.daily_late_fee || 120 // Default to 120 QAR if not specified
        const lateFeeAmount = daysElapsed * dailyLateFee

        // Insert a new record for the late fee
        const { data: newLateFee, error: insertError } = await supabase
          .from('unified_payments')
          .insert({
            lease_id: lease.id,
            amount: lease.rent_amount,
            amount_paid: 0, // No payment made
            balance: lease.rent_amount, // Full balance due
            payment_date: null, // No payment date
            original_due_date: firstOfMonth.toISOString(),
            status: 'pending',
            description: `Auto-generated late payment record for ${today.toLocaleString('default', { month: 'long' })}`,
            type: 'LATE_PAYMENT_FEE',
            late_fine_amount: lateFeeAmount,
            days_overdue: daysElapsed
          })
          .select('id')
          .single()

        if (insertError) {
          console.error(`Error inserting late fee for lease ${lease.id}:`, insertError)
          processResults.push({
            agreement_number: lease.agreement_number,
            success: false,
            error: insertError.message
          })
        } else {
          processedCount++
          processResults.push({
            agreement_number: lease.agreement_number,
            success: true,
            late_fee_amount: lateFeeAmount,
            days_overdue: daysElapsed
          })
        }
      }
    }

    console.log(`Processed ${processedCount} late fee records`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_count: processedCount,
        details: processResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing overdue payments:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
