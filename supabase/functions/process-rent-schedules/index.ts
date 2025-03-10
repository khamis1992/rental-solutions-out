
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { startOfMonth, addMonths, parseISO, isAfter, format } from 'https://esm.sh/date-fns'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting rent schedule processing...')

    // Get all active agreements
    const { data: activeAgreements, error: agreementsError } = await supabase
      .from('leases')
      .select('id, rent_amount, rent_due_day, start_date, daily_late_fee')
      .eq('status', 'active')

    if (agreementsError) throw agreementsError

    console.log(`Found ${activeAgreements?.length || 0} active agreements`)

    const currentDate = new Date()
    const nextMonth = startOfMonth(addMonths(currentDate, 1))
    
    // Process each agreement
    let processedCount = 0
    const processedAgreements = []
    
    for (const agreement of activeAgreements || []) {
      if (!agreement.id) {
        console.error('Agreement has null ID. Skipping.')
        continue
      }

      const agreementStartDate = agreement.start_date ? parseISO(agreement.start_date) : null
      
      // Skip agreements with future start dates beyond next month
      if (agreementStartDate && isAfter(agreementStartDate, addMonths(nextMonth, 1))) {
        console.log(`Agreement ${agreement.id} starts in the future beyond next month. Skipping.`)
        continue
      }

      // For current agreements, create next month's schedule
      // For future agreements starting next month, create schedule for their start month
      const isFutureAgreement = agreementStartDate && isAfter(agreementStartDate, currentDate)
      
      // Determine schedule start month:
      // - For future agreements: use the start date's month
      // - For current agreements: use next month
      const scheduleStartMonth = isFutureAgreement 
        ? startOfMonth(agreementStartDate) 
        : nextMonth
      
      // Force rent due day to be 1st of the month (standardized)
      const dueDay = 1
      
      // Check if schedule already exists for the month (avoid duplicates)
      const { data: existingSchedule } = await supabase
        .from('payment_schedules')
        .select('id')
        .eq('lease_id', agreement.id)
        .gte('due_date', scheduleStartMonth.toISOString())
        .lt('due_date', addMonths(scheduleStartMonth, 1).toISOString())
        .single()

      if (!existingSchedule) {
        // Create new schedule for the month
        const dueDate = new Date(scheduleStartMonth)
        dueDate.setDate(dueDay)

        // Set proper schedule description
        const scheduleDescription = isFutureAgreement
          ? `Initial rent payment for ${format(dueDate, 'MMMM yyyy')}`
          : `Monthly rent payment for ${format(dueDate, 'MMMM yyyy')}`

        const { error: insertError } = await supabase
          .from('payment_schedules')
          .insert({
            lease_id: agreement.id,
            amount: agreement.rent_amount,
            due_date: dueDate.toISOString(),
            status: 'pending',
            description: scheduleDescription
          })

        if (insertError) {
          console.error(`Error creating schedule for agreement ${agreement.id}:`, insertError)
          continue
        }

        processedCount++
        processedAgreements.push({
          id: agreement.id,
          due_date: dueDate.toISOString(),
          amount: agreement.rent_amount
        })

        console.log(`Created schedule for agreement ${agreement.id} due on ${dueDate.toISOString()}`)
      }
    }

    // Process overdue payments for current month (if after 1st of month)
    const today = new Date()
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const daysElapsed = today.getDate() - 1 // Days since the 1st of month
    
    let lateFeesProcessed = 0
    
    if (daysElapsed > 0) {
      console.log(`Processing late fees: ${daysElapsed} days elapsed this month`)
      
      // For each active agreement, check if payment exists for current month
      for (const agreement of activeAgreements || []) {
        if (!agreement.id) continue
        
        // Skip future agreements
        if (agreement.start_date && isAfter(parseISO(agreement.start_date), today)) {
          continue
        }
        
        // Check if a payment already exists for this month
        const { data: existingPayments } = await supabase
          .from('unified_payments')
          .select('id, payment_date')
          .eq('lease_id', agreement.id)
          .gte('payment_date', firstOfMonth.toISOString())
          .lt('payment_date', addMonths(firstOfMonth, 1).toISOString())
        
        // Check if a late fee record already exists for this month
        const { data: existingLateFees } = await supabase
          .from('unified_payments')
          .select('id')
          .eq('lease_id', agreement.id)
          .eq('type', 'LATE_PAYMENT_FEE')
          .eq('original_due_date', firstOfMonth.toISOString())
        
        // If no payment exists for this month and no late fee record exists
        if ((!existingPayments || existingPayments.length === 0) && 
            (!existingLateFees || existingLateFees.length === 0)) {
          
          // Calculate late fee (days elapsed * daily rate)
          const dailyLateFee = agreement.daily_late_fee || 120 // Default to 120 QAR
          const lateFeeAmount = daysElapsed * dailyLateFee
          
          // Insert a late fee record
          const { error: insertError } = await supabase
            .from('unified_payments')
            .insert({
              lease_id: agreement.id,
              amount: agreement.rent_amount,
              amount_paid: 0, // No payment made
              balance: agreement.rent_amount, // Full balance due
              payment_date: null, // No payment date yet
              status: 'pending',
              description: `Auto-generated late payment record for ${format(firstOfMonth, 'MMMM yyyy')}`,
              type: 'LATE_PAYMENT_FEE',
              late_fine_amount: lateFeeAmount,
              days_overdue: daysElapsed,
              original_due_date: firstOfMonth.toISOString()
            })
          
          if (insertError) {
            console.error(`Error inserting late fee for agreement ${agreement.id}:`, insertError)
            continue
          }
          
          lateFeesProcessed++
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Rent schedules processed successfully',
        agreements_processed: activeAgreements?.length || 0,
        schedules_created: processedCount,
        late_fees_processed: lateFeesProcessed
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in process-rent-schedules:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
