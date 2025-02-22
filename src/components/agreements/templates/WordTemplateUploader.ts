
import { supabase } from "@/integrations/supabase/client";
import mammoth from "mammoth";
import { toast } from "sonner";

interface WordProcessingResult {
  content: string;
  variables: string[];
  htmlContent: string;
}

const sanitizeText = (text: string) => text.replace(/\u0000/g, '');

const extractVariables = (content: string): string[] => {
  const variablePattern = /\{\{([^}]+)\}\}/g;
  const matches = content.match(variablePattern) || [];
  return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
};

export const processWordDocument = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<WordProcessingResult> => {
  try {
    onProgress?.(30);
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert Word document to HTML
    const { value: htmlContent, messages } = await mammoth.convertToHtml({ 
      arrayBuffer,
      convertImage: mammoth.images.imgElement((image) => {
        return image.read()
          .then((imageBuffer) => {
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            return {
              src: `data:${image.contentType};base64,${base64Image}`
            };
          });
      })
    });

    if (messages.length > 0) {
      console.warn('Mammoth conversion messages:', messages);
    }

    onProgress?.(50);

    // Extract template variables
    const variables = extractVariables(htmlContent);

    // Sanitize content for storage
    const sanitizedContent = sanitizeText(htmlContent);

    onProgress?.(70);

    return {
      content: sanitizedContent,
      variables,
      htmlContent: htmlContent
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
): Promise<{ publicUrl: string; content: string; variables: string[]; htmlContent: string }> => {
  // Validate file type
  if (!file.name.toLowerCase().endsWith('.docx')) {
    throw new Error('Please upload a valid Word document (.docx)');
  }

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }

  try {
    onProgress?.(10);
    console.log('Processing document...');
    
    // First process the document to verify it's valid
    const { content, variables, htmlContent } = await processWordDocument(file);
    
    onProgress?.(40);
    console.log('Document processed successfully, uploading to storage...');

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    // Upload the original file
    const { error: uploadError } = await supabase.storage
      .from('word_templates')
      .upload(filePath, file, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to upload file to storage');
    }

    onProgress?.(70);
    console.log('File uploaded successfully, getting public URL...');

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('word_templates')
      .getPublicUrl(filePath);

    onProgress?.(80);
    console.log('Creating template entry in database...');

    // Create database entry
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
      // Cleanup: remove uploaded file if database insert fails
      await supabase.storage
        .from('word_templates')
        .remove([filePath]);
        
      console.error('Database insert error:', dbError);
      throw new Error('Failed to save template details');
    }

    onProgress?.(100);
    toast.success('Template uploaded successfully');

    return { publicUrl, content, variables, htmlContent };
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to upload template');
    throw error;
  }
};

export const downloadWordTemplate = async (fileUrl: string): Promise<Blob> => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to download template');
    }
    return await response.blob();
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download template');
  }
};

