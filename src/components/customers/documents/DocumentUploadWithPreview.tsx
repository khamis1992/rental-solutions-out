
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, FileWarning } from "lucide-react";
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
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      setUploadError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      toast.error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      event.target.value = '';
      return;
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = accept.split(',').map(ext => ext.replace('.', '').toLowerCase());
    if (fileExtension && !allowedExtensions.includes(fileExtension)) {
      setUploadError(`Only ${accept.replace(/\./g, '')} files are allowed`);
      toast.error(`Only ${accept.replace(/\./g, '')} files are allowed`);
      event.target.value = '';
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
      setUploadError(null);
      
      // Check if storage bucket exists
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketsError) {
        throw new Error(`Storage error: ${bucketsError.message}`);
      }
      
      const customerDocumentsBucketExists = buckets?.some(
        bucket => bucket.name === 'customer_documents'
      );
      
      if (!customerDocumentsBucketExists) {
        throw new Error('Storage configuration error: customer_documents bucket not found');
      }

      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${documentType.replace(/\s+/g, '_')}/${crypto.randomUUID()}.${fileExt}`;

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
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setUploadError(error.message || 'Failed to upload document');
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelPreview = () => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor={`document-${documentType}`}>{documentType}</Label>
        <Input
          id={`document-${documentType}`}
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
        {uploadError && (
          <div className="flex items-center gap-2 text-destructive text-sm mt-1">
            <FileWarning className="h-4 w-4" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="flex items-center gap-2">
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
          <Button
            variant="outline"
            onClick={cancelPreview}
            disabled={isUploading}
          >
            Cancel
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
