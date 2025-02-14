
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface MasterSheetData {
  id: string;
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  kpis: Record<string, any>;
  metrics: Record<string, any>;
}

export const MasterSheet = () => {
  const { data: masterSheetData, isLoading } = useQuery({
    queryKey: ["master-sheet"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_sheet")
        .select("*")
        .order("date", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as MasterSheetData[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Master Sheet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Profit Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {masterSheetData?.map((row) => {
                const profitMargin = (row.profit / row.revenue) * 100;
                return (
                  <TableRow key={row.id}>
                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(row.revenue)}</TableCell>
                    <TableCell>{formatCurrency(row.expenses)}</TableCell>
                    <TableCell>{formatCurrency(row.profit)}</TableCell>
                    <TableCell>{profitMargin.toFixed(2)}%</TableCell>
                  </TableRow>
                );
              })}
              {(!masterSheetData || masterSheetData.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
