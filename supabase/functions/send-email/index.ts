
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface EmailRequest {
  email: string;
  name: string;
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
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@alaraf.online';
    console.log("API Key present:", !!apiKey);

    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    const body = await req.json();
    console.log("Received request body:", body);

    const { email, name } = body as EmailRequest;

    if (!email || !name) {
      throw new Error("Missing required fields: email and name are required");
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
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
      // Handle specific error cases
      if (data.message?.includes('verify a domain')) {
        throw new Error(`Domain verification required. Please verify your domain at resend.com/domains and update the FROM_EMAIL environment variable to use an email from your verified domain.`);
      }
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
