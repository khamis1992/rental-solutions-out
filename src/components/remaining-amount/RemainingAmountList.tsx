
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, Car, Coins, Receipt, CreditCard, Calculator,
  Clock, Copy, FileBox, CheckCircle, TrendingUp, TrendingDown 
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface RemainingAmount {
  id: string;
  agreement_number: string;
  license_plate: string;
  rent_amount: number;
  final_price: number;
  amount_paid: number;
  remaining_amount: number;
  agreement_duration: string;
}

export function RemainingAmountList() {
  const { data: remainingAmounts, isLoading } = useQuery({
    queryKey: ['remaining-amounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remaining_amounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RemainingAmount[];
    },
  });

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`, {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
  };

  const getPaymentProgress = (paid: number, total: number) => {
    return Math.round((paid / total) * 100);
  };

  const getStatusColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage <= 0) return "text-green-600";
    if (percentage <= 25) return "text-blue-600";
    if (percentage <= 50) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-white/50 backdrop-blur-sm border-blue-500/20 overflow-hidden">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Agreement Number
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-blue-500" />
                    License Plate
                  </div>
                </TableHead>
                <TableHead className="text-right font-semibold">
                  <div className="flex items-center justify-end gap-2">
                    <Coins className="h-4 w-4 text-blue-500" />
                    Rent Amount
                  </div>
                </TableHead>
                <TableHead className="text-right font-semibold">
                  <div className="flex items-center justify-end gap-2">
                    <Receipt className="h-4 w-4 text-blue-500" />
                    Final Price
                  </div>
                </TableHead>
                <TableHead className="text-right font-semibold">
                  <div className="flex items-center justify-end gap-2">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    Amount Paid
                  </div>
                </TableHead>
                <TableHead className="text-right font-semibold">
                  <div className="flex items-center justify-end gap-2">
                    <Calculator className="h-4 w-4 text-blue-500" />
                    Remaining Amount
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Agreement Duration
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {remainingAmounts?.map((item) => {
                const paymentProgress = getPaymentProgress(item.amount_paid, item.final_price);
                const statusColor = getStatusColor(item.remaining_amount, item.final_price);
                const isComplete = item.remaining_amount <= 0;

                return (
                  <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:bg-transparent"
                        onClick={() => copyToClipboard(item.agreement_number, "Agreement number")}
                      >
                        <div className="flex items-center gap-2">
                          {item.agreement_number}
                          <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            {item.license_plate}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Vehicle License: {item.license_plate}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="flex items-center justify-end gap-2">
                        {formatCurrency(item.rent_amount)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="flex items-center justify-end gap-2">
                        {formatCurrency(item.final_price)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="flex items-center justify-end gap-2 tabular-nums">
                          {formatCurrency(item.amount_paid)}
                          {isComplete ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <Tooltip>
                          <TooltipTrigger>
                            <Progress value={paymentProgress} className="h-1.5 w-24 ml-auto" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{paymentProgress}% paid</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-semibold tabular-nums",
                      statusColor
                    )}>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center justify-end gap-2">
                            {formatCurrency(item.remaining_amount)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isComplete ? "Fully Paid" : `${paymentProgress}% Complete`}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {item.agreement_duration}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Duration: {item.agreement_duration}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!remainingAmounts?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="h-[400px] text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-blue-100 p-3">
                        <FileBox className="h-6 w-6 text-blue-500" />
                      </div>
                      <h3 className="font-semibold">No remaining amounts found</h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </TooltipProvider>
  );
}
