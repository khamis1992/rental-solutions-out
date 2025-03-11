
// Supabase Edge Function to process rent schedules and historical payments
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RequestBody {
  agreementId: string;
  processHistorical: boolean;
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
      // Process historical payments for this specific agreement
      const { data, error } = await supabase.rpc('generate_missing_payment_records');
      
      if (error) {
        console.error("Error generating payment records:", error);
        return new Response(
          JSON.stringify({ success: false, message: `Error generating payment records: ${error.message}` }),
          { headers: { 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Filter the results to find only records for this specific agreement
      const agreementRecords = data.filter((record: any) => 
        record.agreement_number && record.id === agreementId
      );
      
      if (agreementRecords.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'No missing payment records found for this agreement' 
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully processed historical payments for agreement ${agreementId}`,
          data: agreementRecords
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Regular rent schedule processing (existing functionality)
      const { data, error } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('lease_id', agreementId)
        .order('due_date', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Found ${data?.length || 0} payment schedules for agreement ${agreementId}`,
          data 
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('Error processing request:', err);
    
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
