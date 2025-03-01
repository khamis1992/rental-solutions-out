
/**
 * useRemainingAmountImport Hook
 * 
 * This custom hook manages the process of importing remaining amount data from CSV files.
 * It handles the upload process, validation, and server-side processing of payment data.
 * 
 * The hook is part of the financial module, specifically for tracking and updating 
 * the remaining amounts on leases/agreements.
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook for handling remaining amount imports via CSV files
 * 
 * @returns An object containing the upload handler function and loading state
 */
export const useRemainingAmountImport = () => {
  // State to track the upload process status
  const [isUploading, setIsUploading] = useState(false);
  
  // Toast notification utility for user feedback
  const { toast } = useToast();

  /**
   * Handles the file upload process for remaining amount imports
   * 
   * @param file - The CSV file to be uploaded
   */
  const handleFileUpload = async (file: File) => {
    // Validate file type - only accept CSV files
    if (file.type !== "text/csv") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // ----- Section: File Upload Process -----
      // Generate a unique file name with timestamp to prevent collisions
      const fileName = `remaining-amounts/${Date.now()}_${file.name}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // ----- Section: Server-side Processing -----
      // Invoke Edge Function to process the uploaded file
      const { error: processingError } = await supabase.functions
        .invoke("process-remaining-amount-import", {
          body: { fileName }
        });

      if (processingError) throw processingError;

      // Notify user of successful import
      toast({
        title: "Success",
        description: "File imported successfully",
      });

    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Return the hook's interface
  return {
    isUploading,
    handleFileUpload,
  };
};
