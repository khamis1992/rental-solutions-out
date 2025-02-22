
import { useState } from "react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { uploadWordTemplate } from "./WordTemplateUploader";
import { Card } from "@/components/ui/card";

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

      console.log('Upload successful:', result);
      setPreview(result.htmlContent);
      toast.success('Template uploaded successfully');
      
      // Clear the input
      event.target.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload template');
      toast.error(error instanceof Error ? error.message : 'Failed to upload template');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Upload Word Template</h3>
              <p className="text-sm text-muted-foreground">
                Upload a Word document (.docx) to create a new template
              </p>
            </div>
          </div>

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
                {progress < 100 ? 'Processing template...' : 'Upload complete!'}
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <EnhancedButton
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            disabled={isUploading}
            loading={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>Processing...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose Word Template
              </>
            )}
          </EnhancedButton>
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
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};
