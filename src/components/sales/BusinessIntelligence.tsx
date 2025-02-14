
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Upload, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const BusinessIntelligence = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importedData, setImportedData] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data: uploadHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["bi-files"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_intelligence_files")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const downloadTemplate = () => {
    const headers = ["Category", "Amount", "Date", "Description", "Type"].join(",");
    const sampleData = [
      "Sales,1000,2024-03-20,Monthly Revenue,Income",
      "Marketing,500,2024-03-21,Ad Campaign,Expense"
    ].join("\n");
    
    const csvContent = `${headers}\n${sampleData}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "business_intelligence_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const Papa = await import("papaparse");
        
        Papa.default.parse(text, {
          header: true,
          complete: async (results) => {
            const headers = results.meta.fields || [];
            const parsedData = results.data;

            try {
              const { error: uploadError } = await supabase
                .from("business_intelligence_files")
                .insert({
                  file_name: file.name,
                  original_name: file.name,
                  content_type: file.type,
                  file_size: file.size,
                  data: parsedData,
                  headers: headers,
                });

              if (uploadError) throw uploadError;

              setHeaders(headers);
              setImportedData(parsedData);
              queryClient.invalidateQueries({ queryKey: ["bi-files"] });
              toast.success("File uploaded successfully");
            } catch (error: any) {
              console.error("Upload error:", error);
              toast.error("Failed to upload file");
            }
          },
          error: (error) => {
            console.error("CSV Parse Error:", error);
            toast.error("Failed to parse CSV file");
          },
        });
      };
      
      reader.readAsText(file);
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error("Failed to import file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Business Intelligence Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="cursor-pointer"
              />
              <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              disabled={isUploading}
              className="whitespace-nowrap"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing file...
            </div>
          )}
        </CardContent>
      </Card>

      {importedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imported Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedData.map((row, index) => (
                    <TableRow key={index}>
                      {headers.map((header) => (
                        <TableCell key={`${index}-${header}`}>
                          {row[header]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadHistory && uploadHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadHistory.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>{file.original_name}</TableCell>
                      <TableCell>{Math.round(file.file_size / 1024)} KB</TableCell>
                      <TableCell>
                        {new Date(file.uploaded_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
