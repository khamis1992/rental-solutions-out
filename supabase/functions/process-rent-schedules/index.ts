
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { startOfMonth, addMonths, parseISO, isAfter, format, isBefore, differenceInMonths } from 'https://esm.sh/date-fns'

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
      .select('id, rent_amount, rent_due_day, start_date, daily_late_fee, agreement_number')
      .eq('status', 'active')

    if (agreementsError) throw agreementsError

    console.log(`Found ${activeAgreements?.length || 0} active agreements`)

    const currentDate = new Date()
    const nextMonth = startOfMonth(addMonths(currentDate, 1))
    
    // Process each agreement
    let processedCount = 0
    let historicalProcessedCount = 0
    const processedAgreements = []
    
    for (const agreement of activeAgreements || []) {
      if (!agreement.id) {
        console.error('Agreement has null ID. Skipping.')
        continue
      }

      // Parse start date safely (handle null or invalid cases)
      const agreementStartDate = agreement.start_date ? parseISO(agreement.start_date) : null
      
      if (!agreementStartDate) {
        console.error(`Agreement ${agreement.id} has no valid start date. Skipping.`)
        continue
      }
      
      // Handle historical agreements (past start dates)
      // Calculate how many months we need to generate schedules for
      if (isBefore(agreementStartDate, currentDate)) {
        // Get existing schedules to avoid duplicates
        const { data: existingSchedules } = await supabase
          .from('payment_schedules')
          .select('due_date')
          .eq('lease_id', agreement.id)
        
        const existingDueDates = new Set(existingSchedules?.map(s => 
          startOfMonth(new Date(s.due_date)).toISOString()
        ) || [])
        
        // Calculate the number of months from start date to next month
        const monthsToGenerate = differenceInMonths(nextMonth, startOfMonth(agreementStartDate)) + 1
        
        console.log(`Agreement ${agreement.agreement_number} started ${format(agreementStartDate, 'yyyy-MM-dd')}, generating ${monthsToGenerate} months of schedules`)
        
        // Generate schedules for each month from start date until next month
        for (let i = 0; i < monthsToGenerate; i++) {
          const scheduleMonth = startOfMonth(addMonths(agreementStartDate, i))
          const scheduleMonthStr = scheduleMonth.toISOString()
          
          // Skip if we already have a schedule for this month
          if (existingDueDates.has(scheduleMonthStr)) {
            console.log(`Schedule for ${format(scheduleMonth, 'MMMM yyyy')} already exists, skipping`)
            continue
          }
          
          // Create new schedule for the month
          const dueDate = new Date(scheduleMonth)
          dueDate.setDate(1) // Standardized to 1st of month
          
          // Set proper schedule description
          const scheduleDescription = i === 0
            ? `Initial rent payment for ${format(dueDate, 'MMMM yyyy')}`
            : `Monthly rent payment for ${format(dueDate, 'MMMM yyyy')}`

          const { error: insertError, data: newSchedule } = await supabase
            .from('payment_schedules')
            .insert({
              lease_id: agreement.id,
              amount: agreement.rent_amount,
              due_date: dueDate.toISOString(),
              status: 'pending',
              description: scheduleDescription
            })
            .select()
            .single()

          if (insertError) {
            console.error(`Error creating schedule for agreement ${agreement.id}:`, insertError)
            continue
          }

          processedCount++
          historicalProcessedCount++
          processedAgreements.push({
            id: agreement.id,
            agreement_number: agreement.agreement_number,
            due_date: dueDate.toISOString(),
            amount: agreement.rent_amount
          })

          console.log(`Created schedule for agreement ${agreement.agreement_number} due on ${dueDate.toISOString()}`)
          
          // For historical months (before current month), also create a late payment record if needed
          if (isBefore(scheduleMonth, startOfMonth(currentDate))) {
            // Check if a payment or late fee record already exists for this month
            const { data: existingPayment } = await supabase
              .from('unified_payments')
              .select('id')
              .eq('lease_id', agreement.id)
              .eq('type', 'Income')
              .gte('payment_date', scheduleMonth.toISOString())
              .lt('payment_date', addMonths(scheduleMonth, 1).toISOString())
              .maybeSingle()
              
            const { data: existingLateFee } = await supabase
              .from('unified_payments')
              .select('id')
              .eq('lease_id', agreement.id)
              .eq('type', 'LATE_PAYMENT_FEE')
              .eq('original_due_date', dueDate.toISOString())
              .maybeSingle()
              
            if (!existingPayment && !existingLateFee) {
              // Calculate standard late fee (30 days for historical)
              const lateFee = 30 * (agreement.daily_late_fee || 120)
              
              // Create late fee record for historical month
              const { error: lateFeeError } = await supabase
                .from('unified_payments')
                .insert({
                  lease_id: agreement.id,
                  amount: agreement.rent_amount,
                  amount_paid: 0,
                  balance: agreement.rent_amount,
                  payment_date: null,
                  status: 'pending',
                  description: `Auto-generated late payment record for ${format(dueDate, 'MMMM yyyy')}`,
                  type: 'LATE_PAYMENT_FEE',
                  late_fine_amount: lateFee,
                  days_overdue: 30, // Standard for historical
                  original_due_date: dueDate.toISOString()
                })
                
              if (lateFeeError) {
                console.error(`Error creating late fee for agreement ${agreement.id}:`, lateFeeError)
              } else {
                console.log(`Created historical late fee for ${agreement.agreement_number} - ${format(dueDate, 'MMMM yyyy')}`)
              }
            }
          }
        }
      } else {
        // For future agreements, create next month's schedule if needed
        // Skip agreements with future start dates beyond next month
        if (isAfter(agreementStartDate, addMonths(nextMonth, 1))) {
          console.log(`Agreement ${agreement.id} starts in the future beyond next month. Skipping.`)
          continue
        }
        
        // For future agreements starting next month, create schedule for their start month
        const isFutureAgreement = isAfter(agreementStartDate, currentDate)
        
        // Determine schedule start month:
        // - For future agreements: use the start date's month
        // - For current agreements: use next month
        const scheduleStartMonth = isFutureAgreement 
          ? startOfMonth(agreementStartDate) 
          : nextMonth
        
        // Always set rent due day to 1st of the month (standardized)
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

          const { error: insertError, data: newSchedule } = await supabase
            .from('payment_schedules')
            .insert({
              lease_id: agreement.id,
              amount: agreement.rent_amount,
              due_date: dueDate.toISOString(),
              status: 'pending',
              description: scheduleDescription
            })
            .select()
            .single()

          if (insertError) {
            console.error(`Error creating schedule for agreement ${agreement.id}:`, insertError)
            continue
          }

          processedCount++
          processedAgreements.push({
            id: agreement.id,
            agreement_number: agreement.agreement_number,
            due_date: dueDate.toISOString(),
            amount: agreement.rent_amount
          })

          console.log(`Created schedule for agreement ${agreement.agreement_number} due on ${dueDate.toISOString()}`)
        }
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
        
        // Skip agreements that started after today
        if (agreement.start_date && isAfter(parseISO(agreement.start_date), today)) {
          continue
        }
        
        // Get the payment schedule for this month
        const { data: currentMonthSchedule } = await supabase
          .from('payment_schedules')
          .select('id')
          .eq('lease_id', agreement.id)
          .gte('due_date', firstOfMonth.toISOString())
          .lt('due_date', addMonths(firstOfMonth, 1).toISOString())
          .single()
          
        if (!currentMonthSchedule) {
          console.log(`No payment schedule found for agreement ${agreement.agreement_number} this month. Creating one.`)
          
          // Create a payment schedule for the current month if it doesn't exist
          const { error: insertScheduleError } = await supabase
            .from('payment_schedules')
            .insert({
              lease_id: agreement.id,
              amount: agreement.rent_amount,
              due_date: firstOfMonth.toISOString(),
              status: 'pending',
              description: `Monthly rent payment for ${format(firstOfMonth, 'MMMM yyyy')}`
            })
            
          if (insertScheduleError) {
            console.error(`Error creating schedule for agreement ${agreement.id}:`, insertScheduleError)
            continue
          }
        }
        
        // Check if a payment already exists for this month
        const { data: existingPayments } = await supabase
          .from('unified_payments')
          .select('id, payment_date')
          .eq('lease_id', agreement.id)
          .gte('payment_date', firstOfMonth.toISOString())
          .lt('payment_date', addMonths(firstOfMonth, 1).toISOString())
          .eq('type', 'Income')
        
        // Check if a late fee record already exists for this month
        const { data: existingLateFees } = await supabase
          .from('unified_payments')
          .select('id, late_fine_amount, days_overdue')
          .eq('lease_id', agreement.id)
          .eq('type', 'LATE_PAYMENT_FEE')
          .eq('original_due_date', firstOfMonth.toISOString())
          .single()
        
        // Calculate late fee (days elapsed * daily rate)
        const dailyLateFee = agreement.daily_late_fee || 120 // Default to 120 QAR
        const lateFeeAmount = daysElapsed * dailyLateFee
        
        // If no payment exists for this month and no late fee record exists
        if ((!existingPayments || existingPayments.length === 0)) {
          if (!existingLateFees) {
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
          } else if (existingLateFees.days_overdue < daysElapsed) {
            // Update the late fee record if days overdue has increased
            const { error: updateError } = await supabase
              .from('unified_payments')
              .update({
                late_fine_amount: lateFeeAmount,
                days_overdue: daysElapsed
              })
              .eq('id', existingLateFees.id)
            
            if (updateError) {
              console.error(`Error updating late fee for agreement ${agreement.id}:`, updateError)
              continue
            }
            
            lateFeesProcessed++
          }
        }
      }
    }

    // Call the SQL function to ensure all missing payment records are generated
    const { error: fnError } = await supabase.rpc('generate_missing_payment_records')
    if (fnError) {
      console.error('Error calling generate_missing_payment_records:', fnError)
    } else {
      console.log('Successfully ran generate_missing_payment_records SQL function')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Rent schedules processed successfully',
        agreements_processed: activeAgreements?.length || 0,
        schedules_created: processedCount,
        historical_schedules_created: historicalProcessedCount,
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
