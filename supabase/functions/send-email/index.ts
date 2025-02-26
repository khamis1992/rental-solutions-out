
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("FROM_EMAIL") || "info@alaraf.online";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

interface EmailRequest {
  templateId: string;
  recipientEmail: string;
  recipientName: string;
  variables: Record<string, any>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!resend) {
      throw new Error('Resend API key not configured');
    }

    const { templateId, recipientEmail, recipientName, variables } = await req.json() as EmailRequest;

    if (!templateId || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .maybeSingle();

    if (templateError || !template) {
      console.error('Template fetch error:', templateError);
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Process template content with variables
    let processedContent = template.content;

    // Replace all variables in the template
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, value?.toString() || '');
    }

    // Replace any remaining standard variables
    processedContent = processedContent
      .replace(/{{customer\.full_name}}/g, recipientName)
      .replace(/{{customer\.email}}/g, recipientEmail)
      .replace(/{{date}}/g, new Date().toLocaleDateString('ar-AE'));

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: template.subject || 'No Subject',
      html: processedContent,
    });

    // Log the email sending
    await supabase
      .from('email_notification_logs')
      .insert({
        template_id: templateId,
        recipient_email: recipientEmail,
        status: 'sent',
        message_id: emailResponse.id,
        metadata: {
          variables,
          processed_content: processedContent,
        },
      });

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.id }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
