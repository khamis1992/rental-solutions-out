
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { RecurringPayments } from "@/components/payments/RecurringPayments";
import { PaymentReconciliation } from "@/components/payments/PaymentReconciliation";
import { Wallet, Receipt, Clock, ArrowUpDown } from "lucide-react";

export const PaymentManagement = () => {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#9b87f5]/10 to-[#E5DEFF]/50 p-8 shadow-lg border border-[#9b87f5]/20 transition-all duration-300 hover:shadow-xl">
        <div className="absolute inset-0 bg-grid-[#9b87f5]/[0.03] bg-[size:20px_20px]" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex -space-x-1">
              <div className="rounded-lg bg-[#9b87f5]/10 p-2">
                <Wallet className="h-6 w-6 text-[#9b87f5]" />
              </div>
              <div className="rounded-lg bg-[#9b87f5]/10 p-2">
                <ArrowUpDown className="h-6 w-6 text-[#9b87f5]" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#1A1F2C] to-[#9b87f5] bg-clip-text text-transparent">
              Payment Management
            </h1>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3 animate-fade-in">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Receipt className="h-4 w-4 text-[#9b87f5]" />
              <span>Track transactions</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-[#9b87f5]" />
              <span>Monitor schedules</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowUpDown className="h-4 w-4 text-[#9b87f5]" />
              <span>Handle reconciliation</span>
            </div>
          </div>
        </div>
      </div>

      <Card className="bg-white/50 backdrop-blur-sm border-[#9b87f5]/20 shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-[#1A1F2C]">Payment Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new-payment" className="space-y-4">
            <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-1">
              <TabsTrigger 
                value="new-payment"
                className="flex items-center gap-2 rounded-md transition-all data-[state=active]:bg-[#9b87f5]/10 data-[state=active]:text-[#9b87f5]"
              >
                <Wallet className="h-4 w-4" />
                New Payment
              </TabsTrigger>
              <TabsTrigger 
                value="recurring"
                className="flex items-center gap-2 rounded-md transition-all data-[state=active]:bg-[#9b87f5]/10 data-[state=active]:text-[#9b87f5]"
              >
                <Clock className="h-4 w-4" />
                Recurring Payments
              </TabsTrigger>
              <TabsTrigger 
                value="reconciliation"
                className="flex items-center gap-2 rounded-md transition-all data-[state=active]:bg-[#9b87f5]/10 data-[state=active]:text-[#9b87f5]"
              >
                <ArrowUpDown className="h-4 w-4" />
                Reconciliation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new-payment" className="animate-fade-in">
              <PaymentForm />
            </TabsContent>

            <TabsContent value="recurring" className="animate-fade-in">
              <RecurringPayments />
            </TabsContent>

            <TabsContent value="reconciliation" className="animate-fade-in">
              <PaymentReconciliation />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
