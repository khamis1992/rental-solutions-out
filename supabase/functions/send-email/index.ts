
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@alaraf.online';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT = 2; // requests per second
const QUEUE_SIZE_LIMIT = 100; // Maximum queue size
let lastRequestTime = 0;
let requestQueue: Array<{
  email: string;
  name: string;
  resolve: (value: Response) => void;
  reject: (reason: any) => void;
}> = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  console.log(`Processing queue. Current size: ${requestQueue.length}`);

  try {
    while (requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      const requiredDelay = (1000 / RATE_LIMIT) - timeSinceLastRequest;

      if (requiredDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, requiredDelay));
      }

      const request = requestQueue.shift();
      if (!request) continue;

      try {
        const { email, name } = request;
        console.log(`Sending email to ${email}`);

        const emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [email],
          subject: "Welcome to Alaraf",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>مرحباً ${name}!</h2>
              <p>شكراً لتسجيلك في العراف. نحن سعداء بانضمامك إلينا.</p>
              <p>سنبقيك على اطلاع بكل جديد.</p>
              <br>
              <p>مع تحياتنا،<br>فريق العراف</p>
            </div>
          `,
        });

        console.log("Email sent successfully:", emailResponse);
        request.resolve(new Response(JSON.stringify(emailResponse), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }));

      } catch (error) {
        console.error("Error sending email:", error);
        request.reject(error);
      }

      lastRequestTime = Date.now();
    }
  } finally {
    isProcessingQueue = false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email and name" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check queue size
    if (requestQueue.length >= QUEUE_SIZE_LIMIT) {
      return new Response(
        JSON.stringify({ error: "Server is busy. Please try again later." }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create a promise that will be resolved when the email is sent
    const responsePromise = new Promise<Response>((resolve, reject) => {
      requestQueue.push({ email, name, resolve, reject });
    });

    // Start processing the queue if it's not already being processed
    processQueue();

    // Wait for the email to be sent and return the response
    return await responsePromise;

  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
