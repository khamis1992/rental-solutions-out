
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { startOfMonth, addMonths, parseISO, isAfter } from 'https://esm.sh/date-fns'

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
      .select('id, rent_amount, rent_due_day, start_date')
      .eq('status', 'active')

    if (agreementsError) throw agreementsError

    console.log(`Found ${activeAgreements?.length || 0} active agreements`)

    const currentDate = new Date()
    const nextMonth = startOfMonth(addMonths(currentDate, 1))
    
    // Process agreements with future start dates
    const futureAgreements = activeAgreements?.filter(agreement => 
      agreement.start_date && isAfter(parseISO(agreement.start_date), currentDate)
    ) || []
    
    if (futureAgreements.length > 0) {
      console.log(`Processing ${futureAgreements.length} future agreements`)
    }

    for (const agreement of activeAgreements || []) {
      const isFutureAgreement = agreement.start_date && isAfter(parseISO(agreement.start_date), currentDate)
      
      // For future agreements, create schedule starting from their start month
      const scheduleStartMonth = isFutureAgreement 
        ? startOfMonth(parseISO(agreement.start_date)) 
        : nextMonth
      
      // Check if schedule already exists for the calculated start month
      const { data: existingSchedule } = await supabase
        .from('payment_schedules')
        .select('id')
        .eq('lease_id', agreement.id)
        .gte('due_date', scheduleStartMonth.toISOString())
        .lt('due_date', addMonths(scheduleStartMonth, 1).toISOString())
        .single()

      if (!existingSchedule) {
        // Create new schedule for next month or start month
        const dueDate = new Date(scheduleStartMonth)
        dueDate.setDate(agreement.rent_due_day || 1)

        const { error: insertError } = await supabase
          .from('payment_schedules')
          .insert({
            lease_id: agreement.id,
            amount: agreement.rent_amount,
            due_date: dueDate.toISOString(),
            status: 'pending'
          })

        if (insertError) {
          console.error(`Error creating schedule for agreement ${agreement.id}:`, insertError)
          continue
        }

        console.log(`Created schedule for agreement ${agreement.id} due on ${dueDate}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Rent schedules processed successfully',
        agreements_processed: activeAgreements?.length || 0,
        future_agreements_processed: futureAgreements.length
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
