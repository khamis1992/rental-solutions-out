
import { useState } from "react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { uploadWordTemplate } from "./WordTemplateUploader";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CustomWordTemplateUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);
      setPreview(null);

      console.log('Starting upload process for file:', file.name);
      
      const result = await uploadWordTemplate(file, (progress) => {
        setProgress(progress);
        console.log('Upload progress:', progress);
      });

      console.log('Upload completed successfully:', result);
      setPreview(result.htmlContent);
      toast.success('Template uploaded successfully');
      
      // Clear the input
      event.target.value = '';
      
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload template';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Upload Word Template</h3>
            <p className="text-sm text-muted-foreground">
              Upload a Word document (.docx) to create a new template. Maximum file size: 5MB.
            </p>
          </div>

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
                  {progress === 100 ? 'Processing completed!' : 'Processing template...'}
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <EnhancedButton
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              disabled={isUploading}
              loading={isUploading}
              className="w-full"
            >
              {isUploading ? (
                'Processing...'
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Choose Word Template
                </>
              )}
            </EnhancedButton>
          </div>
        </div>
      </Card>

      {preview && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <h3 className="font-semibold">Preview</h3>
            </div>
            <div 
              className="prose max-w-none dark:prose-invert border rounded-lg p-4 bg-background"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};
