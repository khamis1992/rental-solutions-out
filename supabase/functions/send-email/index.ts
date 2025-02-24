
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  console.log("Starting send-email function");

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    console.log("API Key present:", !!apiKey);

    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    const body = await req.json();
    console.log("Received request body:", body);

    const { email, name } = body;

    if (!email || !name) {
      throw new Error("Missing required fields: email and name are required");
    }

    // Use native fetch instead of the Resend SDK to avoid dependency issues
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Test Email',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Test Email Configuration</h2>
            <p>Hi ${name},</p>
            <p>This is a test email to verify your email configuration!</p>
            <p>If you're receiving this, your email integration is working correctly.</p>
            <br>
            <p>Best regards,<br>Lovable Team</p>
          </div>
        `
      })
    });

    const data = await response.json();
    console.log("Email API response:", data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        data 
      }),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }), 
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
})
