
/**
 * MaintenanceDocumentUpload Component
 * 
 * This component provides a file upload interface for attaching documents to maintenance records.
 * It handles file selection, validation, and the upload process to Supabase storage.
 * 
 * Part of the maintenance/job-card module, it enables attaching documentation like
 * inspection reports, invoices, or other relevant files to maintenance records.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Props interface for the MaintenanceDocumentUpload component
 * 
 * @property maintenanceId - ID of the maintenance record to attach documents to
 * @property onUploadComplete - Callback function triggered after successful upload
 */
interface MaintenanceDocumentUploadProps {
  maintenanceId: string | null;
  onUploadComplete: () => void;
}

/**
 * Component for uploading documents to maintenance records
 * 
 * @param maintenanceId - ID of the target maintenance record
 * @param onUploadComplete - Callback function after successful upload
 */
export function MaintenanceDocumentUpload({ maintenanceId, onUploadComplete }: MaintenanceDocumentUploadProps) {
  // State to track upload process status
  const [uploading, setUploading] = useState(false);

  /**
   * Handles the file upload process when a file is selected
   * 
   * @param event - The file input change event
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // ----- Section: Input Validation -----
      if (!event.target.files || !event.target.files[0]) return;
      if (!maintenanceId) {
        toast.error("No maintenance ID provided");
        return;
      }

      setUploading(true);
      const file = event.target.files[0];
      
      // Generate unique filename with random component to prevent collisions
      const fileExt = file.name.split('.').pop();
      const filePath = `${maintenanceId}/${Math.random()}.${fileExt}`;

      // ----- Section: File Upload Process -----
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('maintenance_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('maintenance_documents')
        .getPublicUrl(filePath);

      // ----- Section: Database Record Creation -----
      // Create record in the maintenance_documents table
      const { error: dbError } = await supabase
        .from('maintenance_documents')
        .insert({
          maintenance_id: maintenanceId,
          document_type: file.type,
          document_url: publicUrl,
        });

      if (dbError) throw dbError;

      // Notify user of successful upload
      toast.success("Document uploaded successfully");
      onUploadComplete();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(error.message || "Error uploading document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="document">Upload Document</Label>
      <Input
        id="document"
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      {/* Show uploading indicator when in progress */}
      {uploading && (
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 animate-pulse" />
          <span className="text-sm text-muted-foreground">Uploading...</span>
        </div>
      )}
    </div>
  );
}
