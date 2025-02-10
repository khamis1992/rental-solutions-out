import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, Coins, Receipt, CreditCard, Calculator,
  Clock, Copy, FileBox, CheckCircle, TrendingUp, TrendingDown,
  AlertCircle, Calendar, BarChart
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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-12 w-full rounded-md bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-white/50 backdrop-blur-sm border-[#9b87f5]/20 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl h-[calc(100vh-16rem)]">
        <div className="overflow-x-auto">
          <ScrollArea className="h-full">
            <div className="min-w-[1000px]">
              <Table>
                <TableHeader className="bg-gradient-to-r from-[#E5DEFF] to-white sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="font-semibold min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#9b87f5]/10">
                          <FileText className="h-5 w-5 text-[#9b87f5]" />
                        </div>
                        <span className="text-[#1A1F2C]">Agreement Number</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold min-w-[150px]">
                      <div className="flex items-center justify-end gap-2">
                        <div className="p-1.5 rounded-lg bg-[#9b87f5]/10">
                          <Coins className="h-5 w-5 text-[#9b87f5]" />
                        </div>
                        <span className="text-[#1A1F2C]">Rent Amount</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold min-w-[150px]">
                      <div className="flex items-center justify-end gap-2">
                        <div className="p-1.5 rounded-lg bg-[#9b87f5]/10">
                          <Receipt className="h-5 w-5 text-[#9b87f5]" />
                        </div>
                        <span className="text-[#1A1F2C]">Final Price</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold min-w-[200px]">
                      <div className="flex items-center justify-end gap-2">
                        <div className="p-1.5 rounded-lg bg-[#9b87f5]/10">
                          <CreditCard className="h-5 w-5 text-[#9b87f5]" />
                        </div>
                        <span className="text-[#1A1F2C]">Amount Paid</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold min-w-[200px]">
                      <div className="flex items-center justify-end gap-2">
                        <div className="p-1.5 rounded-lg bg-[#9b87f5]/10">
                          <Calculator className="h-5 w-5 text-[#9b87f5]" />
                        </div>
                        <span className="text-[#1A1F2C]">Remaining Amount</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#9b87f5]/10">
                          <Calendar className="h-5 w-5 text-[#9b87f5]" />
                        </div>
                        <span className="text-[#1A1F2C]">Agreement Duration</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {remainingAmounts?.map((item) => {
                    const paymentProgress = getPaymentProgress(item.amount_paid, item.final_price);
                    const statusColor = getStatusColor(item.remaining_amount, item.final_price);
                    const progressColor = getProgressColor(paymentProgress);
                    const isComplete = item.remaining_amount <= 0;

                    return (
                      <TableRow key={item.id} className="group hover:bg-[#E5DEFF]/10 transition-all duration-300">
                        <TableCell className="font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto hover:bg-transparent"
                            onClick={() => copyToClipboard(item.agreement_number, "Agreement number")}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-[#9b87f5]" />
                              {item.agreement_number}
                              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Button>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <div className="flex items-center justify-end gap-2">
                            <Coins className="h-4 w-4 text-[#9b87f5]" />
                            {formatCurrency(item.rent_amount)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <div className="flex items-center justify-end gap-2">
                            <Receipt className="h-4 w-4 text-[#9b87f5]" />
                            {formatCurrency(item.final_price)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-2">
                            <div className="flex items-center justify-end gap-2 tabular-nums">
                              <CreditCard className="h-4 w-4 text-[#9b87f5]" />
                              {formatCurrency(item.amount_paid)}
                              {isComplete ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <Tooltip>
                              <TooltipTrigger>
                                <Progress 
                                  value={paymentProgress} 
                                  className={cn("h-1.5 w-24 ml-auto", progressColor)}
                                />
                              </TooltipTrigger>
                              <TooltipContent className="flex items-center gap-2">
                                <BarChart className="h-4 w-4" />
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
                                <Calculator className="h-4 w-4" />
                                {formatCurrency(item.remaining_amount)}
                                {isComplete ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                                )}
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
                              <div className="flex items-center gap-2 bg-[#E5DEFF]/20 px-2 py-1 rounded-md">
                                <Calendar className="h-4 w-4 text-[#9b87f5]" />
                                {item.agreement_duration}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <p>Duration: {item.agreement_duration}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!remainingAmounts?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-[400px] text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="rounded-full bg-[#E5DEFF] p-4">
                            <FileBox className="h-8 w-8 text-[#9b87f5]" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-[#1A1F2C]">No remaining amounts found</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                              Try adjusting your search criteria or import new remaining amounts data
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </Card>
    </TooltipProvider>
  );
}
