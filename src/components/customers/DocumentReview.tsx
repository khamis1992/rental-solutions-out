
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Check, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface ExtractedDocument {
  id: string;
  customer_id: string;
  document_type: string;
  extracted_data: {
    field: string;
    value: string;
    confidence: number;
  }[];
  status: 'pending' | 'reviewed' | 'rejected';
  upload_date: string;
}

export function DocumentReview() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ["extracted-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracted_documents")
        .select("*")
        .eq("status", "pending")
        .order("upload_date", { ascending: false });

      if (error) throw error;
      return data as ExtractedDocument[];
    }
  });

  const handleConfirm = async (docId: string) => {
    try {
      setProcessing(true);
      const { error } = await supabase
        .from("extracted_documents")
        .update({ status: "reviewed" })
        .eq("id", docId);

      if (error) throw error;

      toast.success("Document reviewed successfully");
      refetch();
    } catch (error: any) {
      console.error("Error confirming document:", error);
      toast.error(error.message || "Failed to confirm document");
    } finally {
      setProcessing(false);
      setSelectedDocId(null);
    }
  };

  const handleReject = async (docId: string) => {
    try {
      setProcessing(true);
      const { error } = await supabase
        .from("extracted_documents")
        .update({ status: "rejected" })
        .eq("id", docId);

      if (error) throw error;

      toast.success("Document rejected");
      refetch();
    } catch (error: any) {
      console.error("Error rejecting document:", error);
      toast.error(error.message || "Failed to reject document");
    } finally {
      setProcessing(false);
      setSelectedDocId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!documents?.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Documents to Review</AlertTitle>
        <AlertDescription>
          There are no pending documents that need review.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList>
        <TabsTrigger value="pending">Pending Review</TabsTrigger>
        <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4">
        <ScrollArea className="h-[60vh]">
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{doc.document_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {doc.extracted_data.map((field, index) => (
                        <div 
                          key={index}
                          className="flex justify-between items-center p-2 rounded-lg bg-muted/50"
                        >
                          <div>
                            <p className="text-sm font-medium">{field.field}</p>
                            <p className="text-sm">{field.value}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {(field.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleReject(doc.id)}
                        disabled={processing}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleConfirm(doc.id)}
                        disabled={processing}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirm
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="reviewed">
        <div className="text-center py-8 text-muted-foreground">
          Previously reviewed documents will be displayed here
        </div>
      </TabsContent>
    </Tabs>
  );
}
