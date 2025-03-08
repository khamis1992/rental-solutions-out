
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionData {
  transaction_date: string;
  amount: number;
}

export const YearOverYearComparison = () => {
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<TransactionData[]> => {
      const { data, error } = await supabase
        .from('accounting_transactions')
        .select('transaction_date, amount');
      
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const calculateYearTotal = (year: number): number => {
    if (!transactions?.length) return 0;
    
    return transactions.reduce((acc, curr) => {
      const transactionDate = curr.transaction_date ? new Date(curr.transaction_date) : null;
      const transactionYear = transactionDate?.getFullYear();
      const amount = typeof curr.amount === 'number' ? curr.amount : 
                     typeof curr.amount === 'string' ? parseFloat(curr.amount) : 0;
      
      return transactionYear === year ? acc + amount : acc;
    }, 0);
  };

  const currentYearTotal = calculateYearTotal(currentYear);
  const lastYearTotal = calculateYearTotal(lastYear);
  
  // Calculate year-over-year change
  const getYearOverYearChange = (): { percent: number, isPositive: boolean } => {
    if (lastYearTotal === 0) return { percent: 0, isPositive: true };
    
    const change = ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100;
    return {
      percent: Math.abs(change),
      isPositive: change >= 0
    };
  };
  
  const yearOverYearChange = getYearOverYearChange();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Year over Year Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <div className="text-red-500">Error loading comparison data</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Current Year ({currentYear})</span>
              <span className="text-lg font-bold">${formatCurrency(currentYearTotal)}</span>
            </div>
            
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Last Year ({lastYear})</span>
              <span className="text-lg font-bold">${formatCurrency(lastYearTotal)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>Year-over-Year:</span>
              <div className={`flex items-center gap-1 ${yearOverYearChange.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {yearOverYearChange.isPositive ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                <span>{yearOverYearChange.percent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};
