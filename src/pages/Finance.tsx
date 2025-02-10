
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialOverview } from "@/components/finance/dashboard/FinancialOverview";
import { FinancialDashboard } from "@/components/finance/FinancialDashboard";
import { CarInstallmentContracts } from "@/components/finance/car-installments/CarInstallmentContracts";
import { PaymentManagement } from "@/components/finance/payments/PaymentManagement";
import { 
  DollarSign, ChartBar, TrendingUp, CreditCard, PieChart, 
  LayoutDashboard, Car, Receipt, Wallet, LineChart, ArrowUpRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function Finance() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <Card className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#9b87f5]/5 via-[#E5DEFF]/30 to-[#9b87f5]/10 p-8 shadow-lg border border-[#9b87f5]/20 transition-all duration-500 hover:shadow-xl group">
        <div className="absolute inset-0 bg-grid-[#9b87f5]/[0.03] bg-[size:20px_20px]" />
        
        {/* Floating Financial Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#9b87f5]/10 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-[#E5DEFF]/30 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700" />
        </div>

        <div className="relative space-y-6">
          {/* Enhanced Title Section */}
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="flex -space-x-2 transform group-hover:scale-105 transition-transform duration-300">
              <div className="rounded-lg bg-gradient-to-br from-[#9b87f5]/20 to-[#9b87f5]/10 p-3 shadow-lg border border-[#9b87f5]/20 backdrop-blur-sm">
                <DollarSign className="h-7 w-7 text-[#9b87f5]" />
              </div>
              <div className="rounded-lg bg-gradient-to-br from-[#9b87f5]/20 to-[#9b87f5]/10 p-3 shadow-lg border border-[#9b87f5]/20 backdrop-blur-sm">
                <ChartBar className="h-7 w-7 text-[#9b87f5]" />
              </div>
              <div className="rounded-lg bg-gradient-to-br from-[#9b87f5]/20 to-[#9b87f5]/10 p-3 shadow-lg border border-[#9b87f5]/20 backdrop-blur-sm">
                <LineChart className="h-7 w-7 text-[#9b87f5]" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#1A1F2C] via-[#9b87f5] to-[#1A1F2C] bg-clip-text text-transparent">
                Financial Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive financial tracking and analysis system
              </p>
            </div>
          </div>
          
          {/* Enhanced Feature Cards */}
          <div className="grid gap-4 md:grid-cols-3 animate-fade-in">
            <Card className="group/card flex items-center gap-3 p-4 transition-all duration-300 hover:shadow-md hover:bg-[#9b87f5]/5 border-[#9b87f5]/20">
              <div className="rounded-lg bg-[#9b87f5]/10 p-2 transition-transform duration-300 group-hover/card:scale-110">
                <TrendingUp className="h-5 w-5 text-[#9b87f5]" />
              </div>
              <div className="space-y-1">
                <div className="font-medium">Track Operations</div>
                <div className="text-sm text-muted-foreground">Monitor financial activities</div>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover/card:opacity-100 transition-opacity" />
            </Card>

            <Card className="group/card flex items-center gap-3 p-4 transition-all duration-300 hover:shadow-md hover:bg-[#9b87f5]/5 border-[#9b87f5]/20">
              <div className="rounded-lg bg-[#9b87f5]/10 p-2 transition-transform duration-300 group-hover/card:scale-110">
                <CreditCard className="h-5 w-5 text-[#9b87f5]" />
              </div>
              <div className="space-y-1">
                <div className="font-medium">Monitor Payments</div>
                <div className="text-sm text-muted-foreground">Track payment status</div>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover/card:opacity-100 transition-opacity" />
            </Card>

            <Card className="group/card flex items-center gap-3 p-4 transition-all duration-300 hover:shadow-md hover:bg-[#9b87f5]/5 border-[#9b87f5]/20">
              <div className="rounded-lg bg-[#9b87f5]/10 p-2 transition-transform duration-300 group-hover/card:scale-110">
                <PieChart className="h-5 w-5 text-[#9b87f5]" />
              </div>
              <div className="space-y-1">
                <div className="font-medium">Analyze Revenue</div>
                <div className="text-sm text-muted-foreground">Review financial metrics</div>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover/card:opacity-100 transition-opacity" />
            </Card>
          </div>
        </div>
      </Card>

      <FinancialOverview />

      {/* Enhanced Tab Navigation */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-1">
          <TabsTrigger 
            value="dashboard"
            className={cn(
              "flex items-center gap-2 rounded-md transition-all",
              "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9b87f5]/20 data-[state=active]:to-[#9b87f5]/10",
              "data-[state=active]:text-[#9b87f5] data-[state=active]:shadow-sm",
              "hover:bg-[#9b87f5]/5"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="car-installments"
            className={cn(
              "flex items-center gap-2 rounded-md transition-all",
              "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9b87f5]/20 data-[state=active]:to-[#9b87f5]/10",
              "data-[state=active]:text-[#9b87f5] data-[state=active]:shadow-sm",
              "hover:bg-[#9b87f5]/5"
            )}
          >
            <div className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              <Receipt className="h-3 w-3" />
            </div>
            Car Installments
          </TabsTrigger>
          <TabsTrigger 
            value="payments"
            className={cn(
              "flex items-center gap-2 rounded-md transition-all",
              "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9b87f5]/20 data-[state=active]:to-[#9b87f5]/10",
              "data-[state=active]:text-[#9b87f5] data-[state=active]:shadow-sm",
              "hover:bg-[#9b87f5]/5"
            )}
          >
            <Wallet className="h-4 w-4" />
            Payments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="animate-fade-in">
          <FinancialDashboard />
        </TabsContent>
        <TabsContent value="car-installments" className="animate-fade-in">
          <CarInstallmentContracts />
        </TabsContent>
        <TabsContent value="payments" className="animate-fade-in">
          <PaymentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
