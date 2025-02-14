
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Upload, FileDown } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

interface ImportedData {
  [key: string]: string;
}

const MasterSheet = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<ImportedData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const downloadTemplate = () => {
    // Create a sample CSV template with the new structure
    const csvContent = [
      'Agreement No,Car No.,Customer Name,Phone Number,ID No.,Rent Amount,Payment,Payment Date,Delay Fines,Pending Amount,Traffic Fine,Note,Insurance Company,Supervisor,Legal Action',
      'AGR-2024-0001,ABC123,John Doe,+971501234567,784-1234-5678901-1,5000,3000,25/01/2024,200,2200,500,Payment pending,AXA Insurance,Mohammed,No Action'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'master_sheet_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            const headers = results.meta.fields || [];
            setHeaders(headers);
            setImportedData(results.data as ImportedData[]);
            toast.success('File imported successfully');
          },
          error: (error) => {
            console.error('CSV Parse Error:', error);
            toast.error('Failed to parse CSV file');
          }
        });
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Master Sheet</h1>
        </div>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Business Intelligence Master Sheet</CardTitle>
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
                Uploading file...
              </div>
            )}
          </CardContent>
        </Card>

        {importedData.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Imported Data</CardTitle>
              <div className="text-sm text-muted-foreground">
                {importedData.length} records imported
              </div>
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
      </div>
    </DashboardLayout>
  );
};

export default MasterSheet;
