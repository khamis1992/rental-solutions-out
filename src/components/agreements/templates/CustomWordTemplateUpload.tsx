
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AgreementType } from "@/types/agreement.types";
import mammoth from "mammoth";

export const CustomWordTemplateUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const sanitizeText = (text: string) => text.replace(/\u0000/g, '');

  const extractTextFromWordDocument = async (file: File) => {
    try {
      setProgress(30);
      const arrayBuffer = await file.arrayBuffer();
      setProgress(50);
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (!result || !result.value) {
        throw new Error('Failed to extract content from document');
      }
      setProgress(70);
      // Sanitize the extracted text
      const sanitizedText = sanitizeText(result.value);
      return sanitizedText;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error(
        error instanceof Error ? `Failed to process document: ${error.message}` : 'Failed to process document'
      );
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
      toast.error('Please upload a valid Word document (.docx)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setProgress(10);

      // Extract content from Word document
      const extractedContent = await extractTextFromWordDocument(file);
      setProgress(80);

      // Create template entry
      const { error: dbError } = await supabase
        .from('agreement_templates')
        .insert({
          name: file.name.replace('.docx', ''),
          content: extractedContent,
          agreement_type: 'short_term' as AgreementType,
          agreement_duration: '12 months',
          is_active: true,
          language: 'english',
          template_structure: {
            textStyle: {
              bold: false,
              italic: false,
              underline: false,
              fontSize: 12,
              alignment: 'left'
            },
            tables: []
          }
        });

      if (dbError) throw dbError;

      setProgress(100);
      toast.success('Template uploaded successfully');
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload template');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Word Template</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="file"
            onChange={handleFileUpload}
            accept=".docx"
            disabled={isUploading}
            className="file:mr-4 file:py-2 file:px-4 
                     file:rounded-full file:border-0 
                     file:text-sm file:font-semibold
                     file:bg-primary file:text-primary-foreground
                     hover:file:bg-primary/90"
          />
          {isUploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">
                Processing template...
              </p>
            </div>
          )}
          <EnhancedButton
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            disabled={isUploading}
            loading={isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Word Template
          </EnhancedButton>
        </div>
      </CardContent>
    </Card>
  );
};
