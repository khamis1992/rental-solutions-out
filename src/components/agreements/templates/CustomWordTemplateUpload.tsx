
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadWordTemplate } from "./WordTemplateUploader";

export const CustomWordTemplateUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

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
      setProgress(0);

      await uploadWordTemplate(file, (progress) => {
        setProgress(progress);
      });

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
  );
};
