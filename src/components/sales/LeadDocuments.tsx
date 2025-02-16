
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUp, Loader2, X, Download, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SalesLead } from "@/types/sales.types";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";

interface LeadDocument {
  id: string;
  document_type: string;
  document_url: string;
  file_name: string;
  file_size: number;
  content_type: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  created_at: string;
}

interface LeadDocumentsProps {
  lead: SalesLead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDocuments({ lead, open, onOpenChange }: LeadDocumentsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<LeadDocument[]>([]);
  const [documentType, setDocumentType] = useState('');

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_lead_documents')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!documentType) {
      toast.error('Please specify the document type');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${lead.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('lead_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lead_documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('sales_lead_documents')
        .insert({
          lead_id: lead.id,
          document_type: documentType,
          document_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          content_type: file.type,
        });

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      setDocumentType('');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Documents - {lead.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4">
              <Label htmlFor="documentType">Document Type</Label>
              <Input
                id="documentType"
                placeholder="e.g., ID Card, License, Contract"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              />
            </div>

            <Button asChild disabled={isUploading || !documentType}>
              <label className="cursor-pointer">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4 mr-2" />
                    Upload Document
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={isUploading}
                />
              </label>
            </Button>
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{doc.document_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {doc.file_name} ({formatBytes(doc.file_size)})
                    </div>
                    <Badge variant="secondary" className={getStatusBadge(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(doc.document_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
