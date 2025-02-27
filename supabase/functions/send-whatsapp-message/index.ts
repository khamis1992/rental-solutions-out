
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppMessageRequest {
  phoneNumber: string;
  message: string;
  leadId?: string;
  messageType?: "text" | "template";
  templateId?: string;
  templateParams?: Record<string, string>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received WhatsApp message request");
    
    // Get ManyChat API credentials from environment variables
    const manyChatApiToken = Deno.env.get("MANYCHAT_API_TOKEN");
    const whatsappBusinessPhoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    
    // Check if ManyChat API token is available
    if (!manyChatApiToken) {
      console.error("MANYCHAT_API_TOKEN is not set");
      return new Response(
        JSON.stringify({ 
          error: "MANYCHAT_API_TOKEN is not configured",
          details: "Please add the MANYCHAT_API_TOKEN to your Supabase Edge Functions environment variables"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Check if WhatsApp business phone ID is available
    if (!whatsappBusinessPhoneId) {
      console.error("WHATSAPP_PHONE_NUMBER_ID is not set");
      return new Response(
        JSON.stringify({ 
          error: "WHATSAPP_PHONE_NUMBER_ID is not configured",
          details: "Please add the WHATSAPP_PHONE_NUMBER_ID to your Supabase Edge Functions environment variables"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Process POST requests for sending messages
    const requestData = await req.json();
    console.log("Request data:", JSON.stringify(requestData, null, 2));
    
    const { phoneNumber, message, leadId, messageType = "text", templateId, templateParams } = requestData as WhatsAppMessageRequest;
    
    if (!phoneNumber) {
      throw new Error("Missing required field: phoneNumber");
    }

    if (messageType === "text" && !message) {
      throw new Error("Missing required field: message for text message type");
    }

    if (messageType === "template" && !templateId) {
      throw new Error("Missing required field: templateId for template message type");
    }

    console.log(`Sending ${messageType} WhatsApp message to: ${phoneNumber}`);
    
    // Format phone number - ensure it has country code
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith("+")) {
      formattedPhone = `+${phoneNumber}`;
    }
    
    // Remove any non-digit characters except the leading +
    formattedPhone = formattedPhone.replace(/[^\d+]/g, "");
    
    // Build request to ManyChat API
    let manyChatEndpoint = "";
    let requestBody = {};

    if (messageType === "text") {
      manyChatEndpoint = "https://api.manychat.com/fb/sending/sendWhatsApp";
      requestBody = {
        subscriber_phone: formattedPhone,
        message_type: "text",
        text_message: message
      };
    } else if (messageType === "template") {
      manyChatEndpoint = "https://api.manychat.com/fb/sending/sendWhatsAppTemplate";
      requestBody = {
        subscriber_phone: formattedPhone,
        template_name: templateId,
        language_code: "en", // Default to English, could be parameterized
        components: templateParams || {}
      };
    }

    console.log("Sending request to ManyChat API:", manyChatEndpoint);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    try {
      // Send the message using ManyChat API
      const response = await fetch(manyChatEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${manyChatApiToken}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      console.log("ManyChat API response:", JSON.stringify(responseData, null, 2));

      // Check for API error in the response
      if (!response.ok) {
        throw new Error(`ManyChat API error: ${JSON.stringify(responseData)}`);
      }

      // Return success response with the API response data
      return new Response(
        JSON.stringify({
          success: true,
          manyChatResponse: responseData,
          messageDetails: {
            phoneNumber: formattedPhone,
            messageType,
            leadId,
            timestamp: new Date().toISOString()
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (apiError) {
      console.error("ManyChat API error:", apiError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send WhatsApp message via ManyChat API", 
          details: apiError.message
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error) {
    console.error("Error in send-whatsapp-message function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
