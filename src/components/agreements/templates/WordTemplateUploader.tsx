
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
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
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

      // Upload original file to storage
      const filename = `${crypto.randomUUID()}.docx`;
      const { error: uploadError } = await supabase.storage
        .from('word_templates')
        .upload(filename, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Create template record with extracted text
      const { error: dbError } = await supabase
        .from('word_templates')
        .insert({
          name: file.name.replace('.docx', ''),
          original_file_url: filename,
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
