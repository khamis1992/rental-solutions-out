
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialOverview } from "@/components/finance/dashboard/FinancialOverview";
import { FinancialDashboard } from "@/components/finance/FinancialDashboard";
import { CarInstallmentContracts } from "@/components/finance/car-installments/CarInstallmentContracts";
import { PaymentManagement } from "@/components/finance/payments/PaymentManagement";
import { DollarSign, ChartBar, TrendingUp, CreditCard, PieChart, LayoutDashboard, Car, Receipt, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Finance() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#9b87f5]/10 to-[#E5DEFF]/50 p-8 shadow-lg border border-[#9b87f5]/20 transition-all duration-300 hover:shadow-xl">
        <div className="absolute inset-0 bg-grid-[#9b87f5]/[0.03] bg-[size:20px_20px]" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex -space-x-1">
              <div className="rounded-lg bg-[#9b87f5]/10 p-2">
                <DollarSign className="h-6 w-6 text-[#9b87f5]" />
              </div>
              <div className="rounded-lg bg-[#9b87f5]/10 p-2">
                <ChartBar className="h-6 w-6 text-[#9b87f5]" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#1A1F2C] to-[#9b87f5] bg-clip-text text-transparent">
              Financial Management
            </h1>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3 animate-fade-in">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-[#9b87f5]" />
              <span>Track operations</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4 text-[#9b87f5]" />
              <span>Monitor payments</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <PieChart className="h-4 w-4 text-[#9b87f5]" />
              <span>Analyze revenue</span>
            </div>
          </div>
        </div>
      </div>

      <FinancialOverview />

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-1">
          <TabsTrigger 
            value="dashboard"
            className={cn(
              "flex items-center gap-2 rounded-md transition-all data-[state=active]:bg-[#9b87f5]/10 data-[state=active]:text-[#9b87f5]"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="car-installments"
            className={cn(
              "flex items-center gap-2 rounded-md transition-all data-[state=active]:bg-[#9b87f5]/10 data-[state=active]:text-[#9b87f5]"
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
              "flex items-center gap-2 rounded-md transition-all data-[state=active]:bg-[#9b87f5]/10 data-[state=active]:text-[#9b87f5]"
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
