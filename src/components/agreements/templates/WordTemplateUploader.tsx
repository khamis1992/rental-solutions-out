
import { useState } from "react";
import { toast } from "sonner";
import mammoth from "mammoth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export function WordTemplateUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateFile = (file: File): string | null => {
    if (!file) return "No file selected";
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return "Please upload a valid Word document (.docx)";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const extractTextFromWordDocument = async (file: File): Promise<string> => {
    try {
      setProgress(30);
      const arrayBuffer = await file.arrayBuffer();
      
      setProgress(50);
      const result = await mammoth.convertToHtml(arrayBuffer);
      
      if (!result || !result.value) {
        throw new Error('Failed to extract content from document');
      }

      setProgress(70);
      return result.value;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to process document: ${error.message}`
          : 'Failed to process document'
      );
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setProgress(10);

      // Extract text content
      const extractedText = await extractTextFromWordDocument(selectedFile);
      
      // Sanitize filename and create a unique path
      const sanitizedFileName = selectedFile.name.replace(/[^\x00-\x7F]/g, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileExt = sanitizedFileName.split('.').pop() || 'docx';
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      setProgress(80);

      // Upload original file to storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('word_templates')
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      setProgress(90);

      // Create template record
      const { error: dbError } = await supabase
        .from('word_templates')
        .insert({
          name: sanitizedFileName.replace('.docx', ''),
          original_file_url: filePath,
          content: extractedText,
          is_active: true,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          processed_status: 'completed'
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`Failed to save template: ${dbError.message}`);
      }

      setProgress(100);
      toast.success('Template uploaded successfully');
      
      // Reset form
      setSelectedFile(null);
      setProgress(0);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) input.value = '';

    } catch (error) {
      console.error('Error uploading template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload template');
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
          <div className="flex flex-col gap-4">
            <Input
              type="file"
              accept=".docx"
              onChange={handleFileSelect}
              disabled={uploading}
              className="max-w-sm"
            />
            {selectedFile && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Template
                    </>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedFile.name}
                </span>
              </div>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-[60%]" />
              <p className="text-sm text-muted-foreground">
                {progress === 100 ? 'Complete!' : 'Processing...'}
              </p>
            </div>
          )}

          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Requirements:</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>File must be a Word document (.docx)</li>
              <li>Maximum file size: 10MB</li>
              <li>Document should contain valid template variables</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
