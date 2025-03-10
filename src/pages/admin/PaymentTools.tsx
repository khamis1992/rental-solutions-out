
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckMissingPayments } from "@/components/agreements/tools/CheckMissingPayments";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function PaymentTools() {
  const [isProcessingRentSchedules, setIsProcessingRentSchedules] = useState(false);
  const [isProcessingOverduePayments, setIsProcessingOverduePayments] = useState(false);

  const runRentScheduleProcess = async () => {
    setIsProcessingRentSchedules(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-rent-schedules");
      
      if (error) throw error;
      
      toast.success(`Successfully processed rent schedules: ${data?.schedules_created || 0} created`);
    } catch (error) {
      console.error("Error processing rent schedules:", error);
      toast.error("Failed to process rent schedules");
    } finally {
      setIsProcessingRentSchedules(false);
    }
  };

  const runOverduePaymentsProcess = async () => {
    setIsProcessingOverduePayments(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-overdue-payments");
      
      if (error) throw error;
      
      toast.success(`Successfully processed overdue payments: ${data?.processed_count || 0} records updated`);
    } catch (error) {
      console.error("Error processing overdue payments:", error);
      toast.error("Failed to process overdue payments");
    } finally {
      setIsProcessingOverduePayments(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Payment System Tools"
        description="Administrative tools for managing and maintaining the payment system"
      />

      <Tabs defaultValue="consistency">
        <TabsList className="mb-4">
          <TabsTrigger value="consistency">Payment Consistency</TabsTrigger>
          <TabsTrigger value="manual-process">Manual Processing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="consistency">
          <CheckMissingPayments />
        </TabsContent>
        
        <TabsContent value="manual-process">
          <Card>
            <CardHeader>
              <CardTitle>Manual Payment Processing</CardTitle>
              <CardDescription>
                Manually trigger payment system processes that normally run on schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Rent Schedules Process</CardTitle>
                    <CardDescription>
                      Creates payment schedules for upcoming months and processes overdue rent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={runRentScheduleProcess} 
                      disabled={isProcessingRentSchedules}
                      className="w-full"
                    >
                      {isProcessingRentSchedules ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Run Rent Schedule Process"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Overdue Payments Process</CardTitle>
                    <CardDescription>
                      Processes late fees for overdue payments and updates payment statuses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={runOverduePaymentsProcess} 
                      disabled={isProcessingOverduePayments}
                      className="w-full"
                    >
                      {isProcessingOverduePayments ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Run Overdue Payments Process"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
