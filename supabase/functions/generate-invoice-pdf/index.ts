
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateReceiptRequest {
  paymentId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { paymentId }: GenerateReceiptRequest = await req.json();

    // Fetch payment details with related information
    const { data: payment, error: paymentError } = await supabase
      .from('unified_payments')
      .select(`
        *,
        leases (
          agreement_number,
          customer_id,
          profiles:customer_id (
            full_name,
            phone_number,
            email
          )
        )
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError) throw paymentError;
    if (!payment) throw new Error('Payment not found');

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // Add company header
    page.drawText('Car Rental Company', {
      x: 50,
      y: height - 50,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });

    // Add receipt details
    const textLines = [
      `Receipt Number: ${payment.id.slice(0, 8)}`,
      `Date: ${new Date(payment.payment_date).toLocaleDateString()}`,
      `Agreement Number: ${payment.leases.agreement_number}`,
      `Customer: ${payment.leases.profiles.full_name}`,
      `Amount Paid: QAR ${payment.amount_paid}`,
      `Payment Method: ${payment.payment_method}`,
      `Status: ${payment.status}`,
    ];

    textLines.forEach((line, index) => {
      page.drawText(line, {
        x: 50,
        y: height - 100 - (index * 25),
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    return new Response(
      pdfBytes,
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="receipt-${payment.id.slice(0, 8)}.pdf"`,
        },
      },
    );
  } catch (error) {
    console.error('Error generating receipt:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
