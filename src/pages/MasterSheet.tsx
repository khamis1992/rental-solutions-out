
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Upload, FileDown } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";

interface MasterSheetData {
  id: string;
  agreement_no: string;
  car_no: string;
  customer_name: string;
  phone_number?: string;
  id_no?: string;
  rent_amount?: number;
  payment?: number;
  payment_date?: string;
  delay_fines?: number;
  pending_amount?: number;
  traffic_fine?: number;
  note?: string;
  insurance_company?: string;
  supervisor?: string;
  legal_action?: string;
  created_at: string;
  updated_at: string;
}

const MasterSheet = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [importedData, setImportedData] = useState<MasterSheetData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    loadMasterSheetData();
  }, []);

  const loadMasterSheetData = async () => {
    try {
      const { data, error } = await supabase
        .from('master_sheet_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setImportedData(data);
        setHeaders(Object.keys(data[0]).filter(key => !['id', 'created_at', 'updated_at'].includes(key)));
      }
    } catch (error) {
      console.error('Error loading master sheet data:', error);
      toast.error('Failed to load master sheet data');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'Agreement No,Car No.,Customer Name,Phone Number,ID No.,Rent Amount,Payment,Payment Date,Delay Fines,Pending Amount,Traffic Fine,Note,Insurance Company,Supervisor,Legal Action',
      'AGR-202401-0001,ABC123,John Doe,+974123456789,ID12345,5000,2500,25/01/2024,120,2500,350,Payment pending,ABC Insurance,John Smith,No Action'
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
          complete: async (results) => {
            const headers = results.meta.fields || [];
            
            // Transform the data to match our database schema
            const transformedData = results.data.map((row: any) => ({
              agreement_no: row['Agreement No'] || '',
              car_no: row['Car No.'] || '',
              customer_name: row['Customer Name'] || '',
              phone_number: row['Phone Number'],
              id_no: row['ID No.'],
              rent_amount: row['Rent Amount'] ? parseFloat(row['Rent Amount']) : null,
              payment: row['Payment'] ? parseFloat(row['Payment']) : null,
              payment_date: row['Payment Date'] || null,
              delay_fines: row['Delay Fines'] ? parseFloat(row['Delay Fines']) : 0,
              pending_amount: row['Pending Amount'] ? parseFloat(row['Pending Amount']) : 0,
              traffic_fine: row['Traffic Fine'] ? parseFloat(row['Traffic Fine']) : 0,
              note: row['Note'],
              insurance_company: row['Insurance Company'],
              supervisor: row['Supervisor'],
              legal_action: row['Legal Action']
            }));

            // Insert the data into Supabase
            const { error } = await supabase
              .from('master_sheet_data')
              .insert(transformedData);

            if (error) throw error;

            toast.success('File imported successfully');
            await loadMasterSheetData(); // Reload the data
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

        <Card className="mt-6 overflow-x-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Master Sheet Data</CardTitle>
            <div className="text-sm text-muted-foreground">
              {importedData.length} records
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHead key={header} className="whitespace-nowrap">
                          {header.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importedData.map((row) => (
                      <TableRow key={row.id}>
                        {headers.map((header) => (
                          <TableCell key={`${row.id}-${header}`} className="whitespace-nowrap">
                            {row[header as keyof MasterSheetData]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MasterSheet;
