
import { RemainingAmountImport } from "@/components/remaining-amount/RemainingAmountImport";
import { RemainingAmountList } from "@/components/remaining-amount/RemainingAmountList";
import { RemainingAmountStats } from "@/components/remaining-amount/RemainingAmountStats";
import { Calculator, ChartBar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

export default function RemainingAmount() {
  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <Card className="p-6 bg-gradient-to-r from-[#E5DEFF] to-white border-[#9b87f5]/20 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#9b87f5]/10">
                <Calculator className="h-6 w-6 text-[#9b87f5]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1A1F2C] hover:text-[#9b87f5] transition-colors">
                Remaining Amounts
              </h1>
            </div>
            <div className="flex items-center gap-2 group">
              <ChartBar className="h-4 w-4 text-[#7E69AB] group-hover:text-[#9b87f5] transition-colors" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-muted-foreground group-hover:text-[#6E59A5] transition-colors">
                      Track and manage remaining amounts for all agreements
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View and manage payment tracking for all rental agreements</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="text-[#9b87f5] border-[#9b87f5]/20 hover:bg-[#9b87f5]/10 hover:text-[#6E59A5] transition-all hover:scale-105"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            <RemainingAmountImport />
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        <RemainingAmountStats />
        <RemainingAmountList />
      </div>
    </div>
  );
}

