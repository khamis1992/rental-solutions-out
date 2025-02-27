
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as crypto from "https://deno.land/std@0.177.0/crypto/mod.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
async function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  return null;
}

// Generate SHA-256 checksum for Sadad
async function generateChecksumHash(params: Record<string, string>, secretKey: string): Promise<string> {
  const paramStr = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&') + `&key=${secretKey}`;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(paramStr);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  
  // Convert to base64
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
  
  return hashBase64;
}

// Generate unique order ID
function generateOrderId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Main Sadad payment processing function
async function processSadadPayment(req: Request) {
  try {
    const { leaseId, customerId, amount, customerEmail, customerPhone, orderId = generateOrderId() } = await req.json();

    // Validate required parameters
    if (!leaseId || !customerId || !amount) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get Sadad merchant credentials from environment variables
    const merchantId = Deno.env.get("SADAD_MERCHANT_ID") || "8432581";
    const secretKey = Deno.env.get("SADAD_SECRET_KEY") || "your-secret-key";

    // Current date in the required format
    const txnDate = new Date().toISOString().replace("T", " ").substring(0, 19);

    // Prepare payment parameters
    const paymentParams = {
      merchant_id: merchantId,
      ORDER_ID: orderId,
      WEBSITE: Deno.env.get("SADAD_WEBSITE") || window.location.origin,
      TXN_AMOUNT: amount.toString(),
      CUST_ID: customerId,
      EMAIL: customerEmail || "",
      MOBILE_NO: customerPhone || "",
      SADAD_WEBCHECKOUT_PAGE_LANGUAGE: "ENG",
      VERSION: "1.1",
      CALLBACK_URL: `${Deno.env.get("PUBLIC_URL") || ""}/customer-portal?payment=callback&orderId=${orderId}`,
      txnDate: txnDate,
    };

    // Generate checksum hash
    const checksumhash = await generateChecksumHash(paymentParams, secretKey);

    // Create new payment record in the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabaseClient
      .from("sadad_payments")
      .insert({
        lease_id: leaseId,
        customer_id: customerId,
        order_id: orderId,
        amount: parseFloat(amount),
        status: "pending",
        transaction_date: txnDate,
        checksumhash: checksumhash,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating payment record:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create payment record" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Return the payment form data
    return new Response(
      JSON.stringify({
        success: true,
        paymentData: {
          ...paymentParams,
          checksumhash: checksumhash,
          productdetail: [
            {
              order_id: orderId,
              itemname: "Rental Payment",
              amount: amount,
              quantity: 1,
              type: "line_item",
            },
          ],
        },
        paymentId: data.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing Sadad payment:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

// Process Sadad callback
async function processSadadCallback(req: Request) {
  try {
    const formData = await req.formData();
    const callbackData: Record<string, string> = {};
    
    // Convert FormData to object
    formData.forEach((value, key) => {
      callbackData[key] = value.toString();
    });

    const orderId = callbackData.ORDER_ID;
    const status = callbackData.STATUS || "unknown";
    const txnId = callbackData.TXNID || "";
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing ORDER_ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Update payment record in the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const paymentStatus = status === "TXN_SUCCESS" ? "completed" : 
                         status === "TXN_FAILURE" ? "failed" : "pending";

    const { data: paymentData, error: paymentError } = await supabaseClient
      .from("sadad_payments")
      .update({
        status: paymentStatus,
        callback_response: callbackData,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)
      .select()
      .single();

    if (paymentError) {
      console.error("Error updating payment record:", paymentError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update payment record" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // If payment was successful, update the lease payment status
    if (paymentStatus === "completed" && paymentData) {
      const { error: leaseError } = await supabaseClient
        .from("leases")
        .update({
          payment_status: "completed",
          last_payment_date: new Date().toISOString(),
        })
        .eq("id", paymentData.lease_id);

      if (leaseError) {
        console.error("Error updating lease payment status:", leaseError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: paymentStatus }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing Sadad callback:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

// Main serve function
serve(async (req) => {
  // Handle CORS
  const corsResponse = await handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  
  // Process Sadad payment
  if (req.method === "POST" && url.pathname.endsWith("/process")) {
    return processSadadPayment(req);
  }
  
  // Process Sadad callback
  if (req.method === "POST" && url.pathname.endsWith("/callback")) {
    return processSadadCallback(req);
  }

  // Return 404 for any other routes
  return new Response(JSON.stringify({ error: "Not found" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 404,
  });
});

// Helper function to create Supabase client
function createClient(
  supabaseUrl: string,
  supabaseKey: string,
) {
  return {
    from: (table: string) => ({
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Prefer': 'return=representation',
                },
                body: JSON.stringify(data),
              });
              if (!response.ok) throw new Error(`Error inserting into ${table}: ${response.statusText}`);
              const responseData = await response.json();
              return { data: responseData[0], error: null };
            } catch (error) {
              console.error(`Error inserting into ${table}:`, error);
              return { data: null, error };
            }
          }
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => {
              try {
                const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Prefer': 'return=representation',
                  },
                  body: JSON.stringify(data),
                });
                if (!response.ok) throw new Error(`Error updating ${table}: ${response.statusText}`);
                const responseData = await response.json();
                return { data: responseData[0], error: null };
              } catch (error) {
                console.error(`Error updating ${table}:`, error);
                return { data: null, error };
              }
            }
          })
        })
      }),
      select: (columns: string = "*") => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&${column}=eq.${value}`, {
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                },
              });
              if (!response.ok) throw new Error(`Error selecting from ${table}: ${response.statusText}`);
              const responseData = await response.json();
              return { data: responseData[0], error: null };
            } catch (error) {
              console.error(`Error selecting from ${table}:`, error);
              return { data: null, error };
            }
          }
        })
      }),
    }),
  };
}
