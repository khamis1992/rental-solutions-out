
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { pdf } from 'https://esm.sh/@react-pdf/renderer'
import React from 'https://esm.sh/react'
import { Document, Page, Text, StyleSheet } from 'https://esm.sh/@react-pdf/renderer'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { agreementId, htmlContent } = await req.json()
    
    if (!agreementId || !htmlContent) {
      throw new Error('Agreement ID and HTML content are required')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create styles
    const styles = StyleSheet.create({
      page: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: 30
      },
      header: {
        fontSize: 24,
        marginBottom: 20
      },
      text: {
        fontSize: 12,
        marginBottom: 10
      }
    });

    // Clean HTML content
    const cleanContent = htmlContent.replace(/<[^>]*>/g, '\n').trim();

    // Create PDF Document using React.createElement instead of JSX
    const doc = React.createElement(Document, {}, 
      React.createElement(Page, { size: "A4", style: styles.page },
        React.createElement(Text, { style: styles.header }, "Invoice"),
        React.createElement(Text, { style: styles.text }, cleanContent)
      )
    );

    // Generate PDF buffer
    const pdfBuffer = await pdf(doc).toBuffer();

    // Generate unique filename
    const timestamp = new Date().toISOString()
    const fileName = `invoice_${agreementId}_${timestamp}.pdf`
    
    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('invoices')
      .getPublicUrl(fileName)

    // Save to generated_invoices table
    const { error: dbError } = await supabase
      .from('generated_invoices')
      .insert({
        agreement_id: agreementId,
        file_path: fileName,
        file_name: fileName,
        is_latest: true
      })

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ 
        success: true,
        url: publicUrl,
        fileName
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in generate-invoice-pdf:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})
