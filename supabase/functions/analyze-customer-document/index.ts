
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'
import { corsHeaders } from '../_shared/cors.ts'
import { createWorker } from 'https://esm.sh/tesseract.js@4.1.1'

interface DocumentAnalysisRequest {
  documentUrl: string;
  documentType: 'id_document' | 'license_document';
  profileId: string;
}

const processDocument = async (documentUrl: string) => {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  
  const response = await fetch(documentUrl);
  const imageBlob = await response.blob();
  
  const { data: { text } } = await worker.recognize(imageBlob);
  await worker.terminate();
  
  return text;
};

const extractDocumentData = (text: string, documentType: string) => {
  // Basic data extraction patterns
  const patterns = {
    name: /name[:\s]+([A-Za-z\s]+)/i,
    id_number: /(?:id|number)[:\s]+([A-Z0-9]+)/i,
    expiry_date: /(?:expiry|valid until)[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
  };

  const extractedData: Record<string, string> = {};
  
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match && match[1]) {
      extractedData[key] = match[1].trim();
    }
  });

  return extractedData;
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { documentUrl, documentType, profileId } = await req.json() as DocumentAnalysisRequest;

    if (!documentUrl || !documentType || !profileId) {
      throw new Error('Missing required fields');
    }

    console.log(`Processing ${documentType} for profile ${profileId}`);

    // Extract text from document
    const extractedText = await processDocument(documentUrl);
    console.log('Extracted text:', extractedText);

    // Extract structured data
    const extractedData = extractDocumentData(extractedText, documentType);
    console.log('Extracted data:', extractedData);

    // Calculate confidence score based on number of fields extracted
    const expectedFields = ['name', 'id_number', 'expiry_date'];
    const extractedFields = Object.keys(extractedData);
    const confidenceScore = extractedFields.length / expectedFields.length;

    // Save analysis results
    const { data: analysisResult, error: analysisError } = await supabaseClient
      .from('document_analysis_results')
      .insert({
        profile_id: profileId,
        document_type: documentType,
        extracted_data: extractedData,
        confidence_score: confidenceScore,
        status: confidenceScore > 0.7 ? 'success' : 'needs_review'
      })
      .select()
      .single();

    if (analysisError) {
      throw analysisError;
    }

    return new Response(
      JSON.stringify({
        message: 'Document analyzed successfully',
        data: analysisResult
      }), 
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({
        error: error.message
      }), 
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
