
// Supabase Edge Function to process rent schedules and historical payments
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RequestBody {
  agreementId: string;
  processHistorical: boolean;
}

interface ProcessingResult {
  id: string;
  agreement_number: string;
  status: string;
  status_description: string;
  rent_amount: number;
  start_date: string;
  current_month: string;
  schedule_count: number;
  payment_count: number;
  distinct_months_scheduled: number;
  distinct_months_paid: number;
  total_months_due: number;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const { agreementId, processHistorical } = await req.json() as RequestBody;
    
    if (!agreementId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Agreement ID is required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Processing agreement ${agreementId}, processHistorical: ${processHistorical}`);
    
    if (processHistorical) {
      try {
        // Get agreement details first to check validity
        const { data: agreement, error: agreementError } = await supabase
          .from('leases')
          .select('id, agreement_number, rent_amount, status, start_date')
          .eq('id', agreementId)
          .single();
          
        if (agreementError) {
          console.error("Error fetching agreement:", agreementError);
          return new Response(
            JSON.stringify({ success: false, message: `Error fetching agreement: ${agreementError.message}` }),
            { headers: { 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        if (!agreement) {
          return new Response(
            JSON.stringify({ success: false, message: 'Agreement not found' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        // Process historical payments using the updated database function
        const { data, error } = await supabase.rpc('generate_missing_payment_records');
        
        if (error) {
          console.error("Error generating payment records:", error);
          return new Response(
            JSON.stringify({ success: false, message: `Error generating payment records: ${error.message}` }),
            { headers: { 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        // Check for results specific to this agreement
        const agreementResults = data?.filter((record: ProcessingResult) => 
          record.agreement_number && record.id === agreementId
        ) || [];
        
        // Also check for the processing summary
        const processSummary = data?.find((record: ProcessingResult) => 
          record.agreement_number === 'PROCESSING_SUMMARY'
        );
        
        if (agreementResults.length === 0 && !processSummary) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'No missing payment records found for this agreement', 
              data: []
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        const responseMessage = agreementResults.length > 0 
          ? `Successfully processed historical payments for agreement ${agreementId}` 
          : processSummary?.status_description || 'Processing completed';
          
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: responseMessage,
            data: agreementResults.length > 0 ? agreementResults : [processSummary]
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (processingError: any) {
        console.error("Processing error:", processingError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Error processing historical payments: ${processingError.message}` 
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } else {
      // Regular rent schedule processing
      try {
        // Get payment schedules for the agreement
        const { data, error } = await supabase
          .from('payment_schedules')
          .select('*')
          .eq('lease_id', agreementId)
          .order('due_date', { ascending: true });
          
        if (error) {
          console.error("Error fetching payment schedules:", error);
          throw error;
        }
        
        // Check if schedules exist
        if (!data || data.length === 0) {
          // If no schedules exist, try to generate them
          const { data: generatedData, error: generationError } = await supabase.rpc('generate_missing_payment_records');
          
          if (generationError) {
            console.error("Error generating payment schedules:", generationError);
            throw generationError;
          }
          
          // Try fetching schedules again after generation
          const { data: newSchedules, error: newError } = await supabase
            .from('payment_schedules')
            .select('*')
            .eq('lease_id', agreementId)
            .order('due_date', { ascending: true });
          
          if (newError) throw newError;
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: `Generated and found ${newSchedules?.length || 0} payment schedules for agreement ${agreementId}`,
              data: newSchedules || [] 
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Found ${data?.length || 0} payment schedules for agreement ${agreementId}`,
            data 
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (scheduleError: any) {
        console.error("Error processing payment schedules:", scheduleError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Error processing payment schedules: ${scheduleError.message}` 
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
  } catch (err: any) {
    console.error('Error processing request:', err);
    
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
