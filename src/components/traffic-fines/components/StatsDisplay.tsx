
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ManualTrafficFineDialog } from "../ManualTrafficFineDialog";
import { RefreshCw, DollarSign, FileText, AlertTriangle, Receipt, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatsDisplayProps {
  paymentCount: number;
  unassignedCount: number;
  totalAmount: number;
  unassignedAmount: number;
  onReconcile: () => void;
  isReconciling: boolean;
}

export function StatsDisplay({ 
  paymentCount, 
  unassignedCount, 
  totalAmount, 
  unassignedAmount,
  onReconcile,
  isReconciling
}: StatsDisplayProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
      <div className="space-y-6">
        <TooltipProvider>
          <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Fines</p>
                  <h3 className="text-2xl font-bold mt-1 text-orange-600">
                    {formatCurrency(totalAmount)}
                  </h3>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <Receipt className="h-6 w-6 text-orange-600" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Total amount of fines in the system</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Count</p>
                  <h3 className="text-2xl font-bold mt-1 text-blue-600">{paymentCount}</h3>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Total number of traffic fines</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>
        <ManualTrafficFineDialog onFineAdded={() => {}} />
      </div>

      <div className="space-y-6">
        <TooltipProvider>
          <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unassigned Fines</p>
                  <h3 className="text-2xl font-bold mt-1 text-yellow-600">
                    {formatCurrency(unassignedAmount)}
                  </h3>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Amount of unassigned fines requiring attention</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unassigned Count</p>
                  <h3 className="text-2xl font-bold mt-1 text-yellow-600">{unassignedCount}</h3>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Number of unassigned fines</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>
        <Button
          onClick={onReconcile}
          disabled={isReconciling || !unassignedCount}
          variant="default"
          size="lg"
          className="w-full text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white group"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isReconciling ? 'animate-spin' : 'group-hover:animate-spin'}`} />
          Auto-Assign All
        </Button>
      </div>
    </div>
  );
}
