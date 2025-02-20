
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Download, FileText } from "lucide-react";
import { format } from "date-fns";

interface DocumentPreviewProps {
  documentUrl?: string;
  documentType: string;
  documentName: string;
  uploadDate?: Date;
  expiryDate?: Date;
}

export const DocumentPreview = ({
  documentUrl,
  documentType,
  documentName,
  uploadDate,
  expiryDate
}: DocumentPreviewProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;
  const isExpiringSoon = expiryDate ? 
    new Date(expiryDate) > new Date() && 
    new Date(expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false;

  const handleDownload = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {documentType}
            </span>
            {isExpired && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                Expired
              </span>
            )}
            {isExpiringSound && (
              <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                Expiring Soon
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground mb-3">{documentName}</p>
          {uploadDate && (
            <p className="text-xs text-muted-foreground">
              Uploaded: {format(new Date(uploadDate), 'MMM dd, yyyy')}
            </p>
          )}
          {expiryDate && (
            <p className="text-xs text-muted-foreground">
              Expires: {format(new Date(expiryDate), 'MMM dd, yyyy')}
            </p>
          )}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{documentName}</DialogTitle>
          </DialogHeader>
          {documentUrl && (
            <iframe
              src={documentUrl}
              className="w-full h-full rounded-md border"
              title={documentName}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
