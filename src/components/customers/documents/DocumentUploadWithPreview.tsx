
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { DocumentPreview } from "./DocumentPreview";

interface DocumentUploadWithPreviewProps {
  onUploadComplete: (url: string) => void;
  documentType: string;
  accept?: string;
  maxSize?: number;
}

export function DocumentUploadWithPreview({
  onUploadComplete,
  documentType,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 5 * 1024 * 1024 // 5MB
}: DocumentUploadWithPreviewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);

      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${documentType}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('customer_documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('customer_documents')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      toast.success('Document uploaded successfully');

      // Clean up
      setSelectedFile(null);
      URL.revokeObjectURL(previewUrl!);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="document">{documentType}</Label>
        <Input
          id="document"
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="file:mr-4 file:py-2 file:px-4 
                   file:rounded-full file:border-0 
                   file:text-sm file:font-semibold
                   file:bg-primary file:text-primary-foreground
                   hover:file:bg-primary/90"
        />
      </div>

      {selectedFile && (
        <div className="flex items-center gap-4">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      )}

      {previewUrl && (
        <DocumentPreview
          fileUrl={previewUrl}
          fileName={selectedFile?.name || ''}
          open={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
