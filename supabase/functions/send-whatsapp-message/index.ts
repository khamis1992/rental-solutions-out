
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppMessageRequest {
  phoneNumber: string;
  message?: string;
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
    
    // Get WhatsApp API credentials from environment variables
    const whatsappToken = Deno.env.get("WHATSAPP_TOKEN");
    const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "+15557246297";
    
    console.log("Using WhatsApp phone number ID:", whatsappPhoneNumberId);
    
    // Check if WhatsApp API token is available
    if (!whatsappToken) {
      console.log("Using demo mode as WHATSAPP_TOKEN is not set");
      
      // For test/demo purposes, just log and return success
      let requestData: WhatsAppMessageRequest;
      
      if (req.method === "POST") {
        requestData = await req.json();
        console.log("Request data:", JSON.stringify(requestData, null, 2));
      } else {
        requestData = {
          phoneNumber: "66707063",
          messageType: "text",
          message: "This is a test message from your car rental system."
        };
      }
      
      // Format phone number - ensure it has country code
      let formattedPhone = requestData.phoneNumber;
      if (!formattedPhone.startsWith("+")) {
        // Add Qatar country code if not provided
        formattedPhone = `+974${formattedPhone}`;
      }
      
      console.log("DEMO MODE: Would send WhatsApp message to:", formattedPhone);
      console.log("DEMO MODE: Message content:", requestData.message);
      
      return new Response(
        JSON.stringify({
          success: true,
          demo: true,
          messageDetails: {
            phoneNumber: formattedPhone,
            messageType: requestData.messageType || "text",
            message: requestData.message,
            leadId: requestData.leadId,
            timestamp: new Date().toISOString()
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // For real API implementation when token is available
    let requestData: WhatsAppMessageRequest;
    
    if (req.method === "POST") {
      requestData = await req.json();
      console.log("Request data:", JSON.stringify(requestData, null, 2));
    } else {
      // Default test case when directly invoking the function
      requestData = {
        phoneNumber: "66707063",
        messageType: "text",
        message: "This is a test message from your car rental system."
      };
    }
    
    // Validate request data
    if (!requestData.phoneNumber) {
      throw new Error("Phone number is required");
    }

    // Format phone number - ensure it has country code
    let formattedPhone = requestData.phoneNumber;
    if (!formattedPhone.startsWith("+")) {
      // Add Qatar country code if not provided
      formattedPhone = `+974${formattedPhone}`;
    }
    
    // Remove any non-digit characters except the leading +
    formattedPhone = formattedPhone.replace(/[^\d+]/g, "");
    console.log("Formatted phone number:", formattedPhone);
    
    // Implementation for actual WhatsApp API call would go here
    // This is where you'd make the actual API call to WhatsApp
    // using the whatsappToken and whatsappPhoneNumberId
    
    console.log("Simulating WhatsApp API call to:", formattedPhone);
    console.log("Message content:", requestData.message);
    
    // Return success response with API simulation for now
    return new Response(
      JSON.stringify({
        success: true,
        messageDetails: {
          phoneNumber: formattedPhone,
          messageType: requestData.messageType || "text",
          message: requestData.message,
          leadId: requestData.leadId,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
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
