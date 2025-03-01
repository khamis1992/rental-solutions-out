
import { useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileWarning } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContractDocumentUploadProps {
  label: string;
  fieldName: string;
  onUploadComplete: (url: string) => void;
}

export const ContractDocumentUpload = ({
  label,
  fieldName,
  onUploadComplete,
}: ContractDocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setErrorMessage(null);

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Please upload a PDF, JPEG, or PNG file.');
      toast.error('Invalid file type. Please upload a PDF, JPEG, or PNG file.');
      event.target.value = ''; // Reset the input
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setErrorMessage('File is too large. Maximum size is 5MB.');
      toast.error('File is too large. Maximum size is 5MB.');
      event.target.value = ''; // Reset the input
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      // First, check if the bucket exists
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        throw new Error('Failed to check storage buckets');
      }

      const customerDocumentsBucketExists = buckets?.some(
        bucket => bucket.name === 'customer_documents'
      );

      if (!customerDocumentsBucketExists) {
        console.error('Customer documents bucket not found');
        throw new Error('Storage configuration error. Please contact support.');
      }

      const { error: uploadError, data } = await supabase.storage
        .from("customer_documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("customer_documents")
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);

      toast.success('Document uploaded successfully');
      event.target.value = ''; // Reset input
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setErrorMessage(error.message || 'Failed to upload document');
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {isUploading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </div>
          
          {errorMessage && (
            <Alert variant="destructive" className="py-2">
              <FileWarning className="h-4 w-4 mr-2" />
              <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
