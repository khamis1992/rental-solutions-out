
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  leadId: string;
  templateId?: string;
  subject: string;
  content: string;
  to: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { leadId, subject, content, to }: EmailRequest = await req.json();

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "Sales Team <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: content,
    });

    // Log the email communication
    const { error: dbError } = await supabase
      .from("email_communications")
      .insert({
        lead_id: leadId,
        subject,
        content,
        sent_at: new Date().toISOString(),
        status: "sent",
        tracking_data: { resend_id: emailResponse.id },
      });

    if (dbError) throw dbError;

    // Update lead activity
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      activity_type: "email_sent",
      description: `Email sent: ${subject}`,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-lead-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
