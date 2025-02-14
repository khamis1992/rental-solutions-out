
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'

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

    // Launch browser
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    
    // Set content and wait for network idle
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    })

    await browser.close()

    // Generate unique filename
    const timestamp = new Date().toISOString()
    const fileName = `invoice_${agreementId}_${timestamp}.pdf`
    
    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, pdf, {
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
