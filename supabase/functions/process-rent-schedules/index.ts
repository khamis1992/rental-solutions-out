
// Supabase Edge Function to process rent schedules and historical payments
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RequestBody {
  agreementId?: string;
  processHistorical: boolean;
  bulkProcess?: boolean;
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

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }
  
  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body with robust error handling
    let requestData;
    try {
      const rawBody = await req.text();
      console.log("Raw request body:", rawBody);
      
      if (!rawBody || rawBody.trim() === '') {
        throw new Error('Empty request body');
      }
      
      requestData = JSON.parse(rawBody);
      console.log("Parsed request data:", requestData);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Invalid JSON format: ${parseError.message}` 
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }, 
          status: 400 
        }
      );
    }
    
    const { agreementId, processHistorical, bulkProcess } = requestData as RequestBody;
    
    console.log(`Processing request: agreementId=${agreementId}, processHistorical=${processHistorical}, bulkProcess=${bulkProcess}`);
    
    // Validate request parameters
    if (!processHistorical && !agreementId && !bulkProcess) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Either agreementId or bulkProcess flag is required for non-historical processing' 
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }, 
          status: 400 
        }
      );
    }
    
    if (bulkProcess) {
      try {
        console.log("Starting bulk processing of rent schedules");
        
        // Execute a custom SQL function to fix the ambiguous column issue
        // This SQL is a wrapper that properly qualifies all vehicle_id references
        const { data, error } = await supabase.rpc('generate_missing_payment_records_with_qualified_columns');
        
        if (error) {
          console.error("Error in bulk processing:", error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: `Error in bulk processing: ${error.message}`,
              details: error
            }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              }, 
              status: 500 
            }
          );
        }
        
        // Find the processing summary
        const processSummary = data?.find((record: ProcessingResult) => 
          record.agreement_number === 'PROCESSING_SUMMARY'
        );
        
        console.log("Bulk processing completed successfully:", processSummary);
        console.log("Result data:", data);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: processSummary?.status_description || 'Bulk processing completed',
            data: data || []
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          }
        );
      } catch (processingError: any) {
        console.error("Bulk processing error:", processingError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Error processing bulk request: ${processingError.message}`,
            error: processingError
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }, 
            status: 500 
          }
        );
      }
    } else if (processHistorical && agreementId) {
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
            JSON.stringify({ 
              success: false, 
              message: `Error fetching agreement: ${agreementError.message}` 
            }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              }, 
              status: 500 
            }
          );
        }
        
        if (!agreement) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Agreement not found' 
            }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              } 
            }
          );
        }
        
        // Process with the fixed function that properly qualifies column references
        const { data, error } = await supabase.rpc('generate_missing_payment_records_with_qualified_columns');
        
        if (error) {
          console.error("Error generating payment records:", error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: `Error generating payment records: ${error.message}` 
            }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              }, 
              status: 500 
            }
          );
        }
        
        // Check for results specific to this agreement
        const agreementResults = data?.filter((record: ProcessingResult) => 
          record.id === agreementId
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
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              } 
            }
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
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
      } catch (processingError: any) {
        console.error("Processing error:", processingError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Error processing historical payments: ${processingError.message}` 
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }, 
            status: 500 
          }
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
          // If no schedules exist, try to generate them using the fixed function
          const { data: generatedData, error: generationError } = await supabase.rpc('generate_missing_payment_records_with_qualified_columns');
          
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
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Found ${data?.length || 0} payment schedules for agreement ${agreementId}`,
            data 
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
      } catch (scheduleError: any) {
        console.error("Error processing payment schedules:", scheduleError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Error processing payment schedules: ${scheduleError.message}` 
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }, 
            status: 500 
          }
        );
      }
    }
  } catch (err: any) {
    console.error('Error processing request:', err);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: err.message || 'An unexpected error occurred',
        error: err.toString()
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }, 
        status: 500 
      }
    );
  }
});
