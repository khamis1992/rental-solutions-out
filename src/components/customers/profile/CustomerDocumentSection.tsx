
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentPreview } from "./DocumentPreview";
import { ContractDocumentUpload } from "../ContractDocumentUpload";

interface CustomerDocumentSectionProps {
  profile: any; // We'll type this properly once we have the full profile type
}

export const CustomerDocumentSection = ({ profile }: CustomerDocumentSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <DocumentPreview
          documentType="ID Document"
          documentName={profile?.id_document_url?.split("/").pop() || "ID Document"}
          documentUrl={profile?.id_document_url}
          uploadDate={profile?.id_document_uploaded_at}
          expiryDate={profile?.id_document_expiry}
        />
        
        <DocumentPreview
          documentType="Driver License"
          documentName={profile?.license_document_url?.split("/").pop() || "Driver License"}
          documentUrl={profile?.license_document_url}
          uploadDate={profile?.license_document_uploaded_at}
          expiryDate={profile?.license_document_expiry}
        />

        {/* Upload Section */}
        <div className="md:col-span-2 pt-4">
          <ContractDocumentUpload
            label="Upload New Document"
            fieldName="document_url"
            onUploadComplete={(url) => {
              // Handle upload complete
              console.log("Document uploaded:", url);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
