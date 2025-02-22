
import { useState } from "react";
import { toast } from "sonner";
import mammoth from "mammoth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WordTemplateUploader() {
  const [uploading, setUploading] = useState(false);

  const extractTextFromWordDocument = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Passing the ArrayBuffer directly to mammoth instead of as an object
      const result = await mammoth.extractRawText(arrayBuffer);
      if (!result || !result.value) {
        throw new Error('Failed to extract text from document');
      }
      return result.value;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.name.endsWith('.docx')) {
        toast.error('Please upload a Word document (.docx)');
        return;
      }

      // First, extract text content using mammoth
      const extractedText = await extractTextFromWordDocument(file);
      console.log('Extracted text:', extractedText); // For debugging
      
      // Sanitize filename and create a unique path
      const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
      const fileExt = sanitizedFileName.split('.').pop() || 'docx';
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      // Upload original file to storage
      const { error: uploadError } = await supabase.storage
        .from('word_templates')
        .upload(filePath, file, {
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Create template record with extracted text
      const { error: dbError } = await supabase
        .from('word_templates')
        .insert({
          name: sanitizedFileName.replace('.docx', ''),
          original_file_url: filePath,
          content: extractedText,
          is_active: true
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      toast.success('Template uploaded successfully');
      event.target.value = ''; // Reset input
    } catch (error) {
      console.error('Error uploading template:', error);
      toast.error('Failed to upload template. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Upload Template</CardTitle>
        <CardDescription>
          Upload a new Word document template (.docx)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="max-w-sm"
          />
          <p className="text-sm text-muted-foreground">
            Upload a Word document (.docx) with variable placeholders
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
