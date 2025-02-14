
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Master Sheet
          </CardTitle>
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
                  <TableHead>Margin</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {masterSheetData?.map((row, index) => {
                  const profitMargin = (row.profit / row.revenue) * 100;
                  const prevProfit = index < masterSheetData.length - 1 ? masterSheetData[index + 1].profit : row.profit;
                  const isIncreasing = row.profit >= prevProfit;

                  return (
                    <TableRow key={row.id}>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(row.revenue)}</TableCell>
                      <TableCell>{formatCurrency(row.expenses)}</TableCell>
                      <TableCell>{formatCurrency(row.profit)}</TableCell>
                      <TableCell>{profitMargin.toFixed(1)}%</TableCell>
                      <TableCell>
                        {isIncreasing ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!masterSheetData || masterSheetData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
