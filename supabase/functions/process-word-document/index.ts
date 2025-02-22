
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as docx from 'https://esm.sh/docx-templates@4.11.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { templateId, agreementId } = await req.json()

    if (!templateId || !agreementId) {
      throw new Error('Template ID and Agreement ID are required')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get template details
    const { data: template, error: templateError } = await supabase
      .from('word_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      throw new Error('Template not found')
    }

    // Get agreement details with related data
    const { data: agreement, error: agreementError } = await supabase
      .from('leases')
      .select(`
        *,
        customer:customer_id (
          full_name,
          phone_number,
          address,
          nationality
        ),
        vehicle:vehicle_id (
          make,
          model,
          year,
          license_plate,
          vin,
          color
        )
      `)
      .eq('id', agreementId)
      .single()

    if (agreementError || !agreement) {
      throw new Error('Agreement not found')
    }

    // Download template file
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('word_templates')
      .download(template.original_file_url)

    if (downloadError || !fileData) {
      throw new Error('Failed to download template file')
    }

    // Prepare variable replacements
    const variables = {
      customer: {
        full_name: agreement.customer?.full_name || '',
        phone_number: agreement.customer?.phone_number || '',
        address: agreement.customer?.address || '',
        nationality: agreement.customer?.nationality || ''
      },
      vehicle: {
        make: agreement.vehicle?.make || '',
        model: agreement.vehicle?.model || '',
        year: agreement.vehicle?.year || '',
        license_plate: agreement.vehicle?.license_plate || '',
        vin: agreement.vehicle?.vin || '',
        color: agreement.vehicle?.color || ''
      },
      agreement: {
        agreement_number: agreement.agreement_number || '',
        start_date: agreement.start_date || '',
        end_date: agreement.end_date || '',
        rent_amount: agreement.rent_amount || '',
        total_amount: agreement.total_amount || ''
      }
    }

    // Process document with variables
    const processedBuffer = await docx.createReport({
      template: fileData,
      data: variables
    })

    // Generate unique filename
    const filename = `processed_${agreementId}_${Date.now()}.docx`

    // Upload processed file
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('word_templates')
      .upload(`processed/${filename}`, processedBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

    if (uploadError) {
      throw new Error('Failed to upload processed document')
    }

    // Create processed document record
    const { data: processedDoc, error: processedError } = await supabase
      .from('processed_documents')
      .insert({
        template_id: templateId,
        agreement_id: agreementId,
        processed_file_url: `processed/${filename}`,
        processing_status: 'completed'
      })
      .select()
      .single()

    if (processedError) {
      throw new Error('Failed to create processed document record')
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: processedDoc
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing document:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
