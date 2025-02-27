
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  recipientEmail: string;
  recipientName?: string;
  emailType?: "welcome" | "test";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received email request");
    
    // Initialize the Resend client with the API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    // Check if Resend API key is available
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY is not configured",
          details: "Please add the RESEND_API_KEY to your Supabase Edge Functions environment variables in the Supabase dashboard."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const resend = new Resend(resendApiKey);
    
    // Process POST requests for sending emails
    const requestData = await req.json();
    console.log("Request data:", JSON.stringify(requestData, null, 2));
    
    const { recipientEmail, recipientName, emailType = "welcome" } = requestData as EmailRequest;
    
    if (!recipientEmail) {
      throw new Error("Missing required field: recipientEmail");
    }

    console.log(`Sending ${emailType} email to: ${recipientEmail}`);
    
    // Template for welcome email
    let htmlContent = "";
    let subject = "";

    if (emailType === 'welcome') {
      subject = "Payment System: Standardized Monthly Payments";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f4f4f4; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .highlight { background-color: #ffffcc; padding: 2px 5px; font-weight: bold; }
            .footer { background: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Standardized Payment System</h2>
            </div>
            <div class="content">
              <p>Dear ${recipientName || recipientEmail},</p>
              <p>Thank you for joining our vehicle rental platform. We're excited to have you as part of our community!</p>
              <p>We want to inform you about our standardized payment system:</p>
              <ul>
                <li><span class="highlight">All monthly payments are due on the 1st of each month.</span></li>
                <li>Late payments after the 1st will incur a daily fee of 120 QAR per day.</li>
                <li>Payment confirmations are sent automatically.</li>
                <li>You can view your payment history and upcoming payments in your account dashboard.</li>
              </ul>
              <p>This standardized system helps ensure clarity and consistency for all our customers.</p>
              <p>If you have any questions about payments, please don't hesitate to contact our customer support team.</p>
              <p>Best regards,<br>The Vehicle Rental Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = "Payment System Test Email";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f4f4f4; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .highlight { background-color: #ffffcc; padding: 2px 5px; font-weight: bold; }
            .footer { background: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Email System Test</h2>
            </div>
            <div class="content">
              <p>Dear ${recipientName || recipientEmail},</p>
              <p>This is a test email to verify that our email sending system is working correctly.</p>
              <p>If you received this email, it means our system is functioning as expected.</p>
              <p>Key features of our standardized payment system:</p>
              <ul>
                <li><span class="highlight">All payments are due on the 1st of each month</span></li>
                <li>Late payments are subject to automatic fees of 120 QAR per day</li>
                <li>Payment confirmations are sent automatically</li>
              </ul>
              <p>Best regards,<br>The System Admin Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    console.log("Sending email with Resend...");

    try {
      // Send the email using Resend
      const emailResponse = await resend.emails.send({
        from: "Vehicle Rental System <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: subject,
        html: htmlContent,
      });

      console.log("Email sent successfully:", emailResponse);

      // Return success response
      return new Response(JSON.stringify(emailResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (sendError: any) {
      console.error("Resend API error:", sendError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email", 
          details: sendError.message,
          apiError: sendError
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        stack: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
