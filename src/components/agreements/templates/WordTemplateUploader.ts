
import { supabase } from "@/integrations/supabase/client";
import mammoth from "mammoth";
import { toast } from "sonner";

interface WordProcessingResult {
  content: string;
  variables: string[];
  htmlContent: string;
}

const extractVariables = (content: string): string[] => {
  const variablePattern = /\{\{([^}]+)\}\}/g;
  const matches = content.match(variablePattern) || [];
  return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
};

export const uploadWordTemplate = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<WordProcessingResult> => {
  try {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
      throw new Error('Please upload a valid Word document (.docx)');
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    onProgress?.(10);
    console.log('Starting file upload...');

    // First upload the original file
    const fileExt = file.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('customer_documents')
      .upload(filePath, file, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload document');
    }

    onProgress?.(40);
    console.log('File uploaded, processing content...');

    // Convert file to array buffer for mammoth processing
    const arrayBuffer = await file.arrayBuffer();

    // Process document with mammoth
    const { value: htmlContent } = await mammoth.convertToHtml({ arrayBuffer });

    onProgress?.(70);
    console.log('Content processed, extracting variables...');

    // Extract template variables
    const variables = extractVariables(htmlContent);

    onProgress?.(90);
    console.log('Variables extracted, saving to database...');

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('customer_documents')
      .getPublicUrl(filePath);

    // Save template details to database
    const { error: dbError } = await supabase.from('word_templates').insert({
      name: file.name.replace('.docx', ''),
      original_file_url: publicUrl,
      content: htmlContent,
      variable_mappings: variables.reduce((acc, variable) => ({
        ...acc,
        [variable]: ''
      }), {}),
      is_active: true
    });

    if (dbError) {
      // Clean up the uploaded file if database insert fails
      await supabase.storage
        .from('customer_documents')
        .remove([filePath]);
      
      console.error('Database error:', dbError);
      throw new Error('Failed to save template details');
    }

    onProgress?.(100);
    console.log('Template saved successfully');

    return {
      content: htmlContent,
      variables,
      htmlContent
    };
  } catch (error) {
    console.error('Template upload failed:', error);
    throw error;
  }
};

export const downloadWordTemplate = async (fileUrl: string): Promise<Blob> => {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error('Failed to download template');
  }
  return response.blob();
};
