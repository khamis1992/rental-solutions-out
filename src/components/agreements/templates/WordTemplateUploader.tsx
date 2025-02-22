
import { useState } from "react";
import mammoth from "mammoth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WordProcessingResult {
  content: string;
  variables: string[];
}

const sanitizeText = (text: string) => text.replace(/\u0000/g, '');

export const processWordDocument = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<WordProcessingResult> => {
  try {
    onProgress?.(30);
    const arrayBuffer = await file.arrayBuffer();
    
    onProgress?.(50);
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    if (!result || !result.value) {
      throw new Error('Failed to extract content from document');
    }

    onProgress?.(70);
    
    // Find template variables in the content (matching {{variable}})
    const variableMatches = result.value.match(/\{\{([^}]+)\}\}/g) || [];
    const variables = [...new Set(variableMatches.map(v => v.replace(/[{}]/g, '')))];

    // Sanitize content
    const sanitizedContent = sanitizeText(result.value);

    return {
      content: sanitizedContent,
      variables
    };
  } catch (error) {
    console.error('Error processing Word document:', error);
    throw new Error(
      error instanceof Error ? `Failed to process document: ${error.message}` : 'Failed to process document'
    );
  }
};

export const uploadWordTemplate = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ publicUrl: string; content: string; variables: string[] }> => {
  try {
    // First upload the file to storage
    const fileExt = file.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    onProgress?.(20);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('word_templates')
      .upload(filePath, file, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to upload file to storage');
    }

    onProgress?.(40);

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('word_templates')
      .getPublicUrl(filePath);

    onProgress?.(60);

    // Process the Word document
    const { content, variables } = await processWordDocument(file);
    
    onProgress?.(80);

    // Create the template entry
    const { error: dbError } = await supabase
      .from('word_templates')
      .insert({
        name: file.name.replace('.docx', ''),
        original_file_url: publicUrl,
        content: content,
        variable_mappings: variables.reduce((acc, variable) => ({
          ...acc,
          [variable]: ''
        }), {}),
        is_active: true
      });

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw new Error('Failed to save template details');
    }

    onProgress?.(100);
    toast.success('Template uploaded successfully');

    return { publicUrl, content, variables };
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to upload template');
    throw error;
  }
};
