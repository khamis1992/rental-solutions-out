
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from "npm:resend@3.0.0"

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
  console.log("Received request:", req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

    // Get and validate API key
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY environment variable");
      throw new Error("Email service configuration error");
    }

    // Initialize Resend
    const resend = new Resend(apiKey);

    // Parse and validate request body
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error("Content-Type must be application/json");
    }

    const body = await req.json();
    console.log("Received request body:", body);

    // Validate required fields
    if (!body.email || !body.name) {
      throw new Error("Missing required fields: email and name are required");
    }

    const { email, name }: EmailRequest = body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    console.log(`Attempting to send test email to: ${email}`);

    // Send email
    const { data, error } = await resend.emails.send({
      from: "Lovable <onboarding@resend.dev>",
      to: email,
      subject: "Test Email",
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
    });

    if (error) {
      console.error("Resend API error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

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
