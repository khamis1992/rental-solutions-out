
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploadWithPreview } from "../documents/DocumentUploadWithPreview";
import { DocumentExpiryTracker } from "../documents/DocumentExpiryTracker";
import { DocumentVerificationStatus } from "../documents/DocumentVerificationStatus";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerDocumentSectionProps {
  profile: {
    id: string;
    id_document_url?: string | null;
    license_document_url?: string | null;
    id_document_expiry?: string | null;
    license_document_expiry?: string | null;
    document_verification_status?: string;
  };
}

export function CustomerDocumentSection({ profile }: CustomerDocumentSectionProps) {
  const queryClient = useQueryClient();

  const handleUploadComplete = async (documentType: 'id' | 'license', url: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          [`${documentType}_document_url`]: url,
          document_verification_status: 'pending'
        })
        .eq('id', profile.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['customer-profile', profile.id] });
    } catch (error: any) {
      console.error('Error updating document URL:', error);
      toast.error(error.message || 'Failed to update document');
    }
  };

  const handleExpiryDateChange = async (documentType: 'id' | 'license', date: Date | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          [`${documentType}_document_expiry`]: date?.toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['customer-profile', profile.id] });
      toast.success('Expiry date updated successfully');
    } catch (error: any) {
      console.error('Error updating expiry date:', error);
      toast.error(error.message || 'Failed to update expiry date');
    }
  };

  const handleVerification = async (status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          document_verification_status: status
        })
        .eq('id', profile.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['customer-profile', profile.id] });
      toast.success(`Document ${status} successfully`);
    } catch (error: any) {
      console.error('Error updating verification status:', error);
      toast.error(error.message || 'Failed to update verification status');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* ID Document Section */}
          <div className="space-y-4">
            <DocumentUploadWithPreview
              documentType="ID Document"
              onUploadComplete={(url) => handleUploadComplete('id', url)}
            />
            {profile.id_document_url && (
              <>
                <DocumentVerificationStatus
                  documentType="ID Document"
                  documentUrl={profile.id_document_url}
                  status={profile.document_verification_status as any || 'pending'}
                  onVerify={() => handleVerification('verified')}
                  onReject={() => handleVerification('rejected')}
                />
                <DocumentExpiryTracker
                  documentType="ID Document"
                  expiryDate={profile.id_document_expiry ? new Date(profile.id_document_expiry) : null}
                  onExpiryDateChange={(date) => handleExpiryDateChange('id', date)}
                  verificationStatus={profile.document_verification_status as any || 'pending'}
                />
              </>
            )}
          </div>

          {/* Driver License Section */}
          <div className="space-y-4">
            <DocumentUploadWithPreview
              documentType="Driver License"
              onUploadComplete={(url) => handleUploadComplete('license', url)}
            />
            {profile.license_document_url && (
              <>
                <DocumentVerificationStatus
                  documentType="Driver License"
                  documentUrl={profile.license_document_url}
                  status={profile.document_verification_status as any || 'pending'}
                  onVerify={() => handleVerification('verified')}
                  onReject={() => handleVerification('rejected')}
                />
                <DocumentExpiryTracker
                  documentType="Driver License"
                  expiryDate={profile.license_document_expiry ? new Date(profile.license_document_expiry) : null}
                  onExpiryDateChange={(date) => handleExpiryDateChange('license', date)}
                  verificationStatus={profile.document_verification_status as any || 'pending'}
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
