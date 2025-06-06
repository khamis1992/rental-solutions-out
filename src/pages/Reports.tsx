
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet } from "lucide-react";
import { CustomerReportSection } from "@/components/reports/sections/CustomerReportSection";
import { OperationalReportSection } from "@/components/reports/sections/OperationalReportSection";
import { FinancialReportSection } from "@/components/reports/sections/FinancialReportSection";
import { FleetAnalyticsDashboard } from "@/components/reports/FleetAnalytics/FleetAnalyticsDashboard";
import { AdvancedAnalytics } from "@/components/reports/AdvancedAnalytics/AdvancedAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { PendingPaymentsReport } from "@/components/reports/sections/PendingPaymentsReport";
import { VehicleTrafficFinesReport } from "@/components/reports/sections/VehicleTrafficFinesReport";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("");

  const generateReport = () => {
    if (!selectedReport) {
      toast.error("Please select a report type first");
      return;
    }
    
    toast.success("Generating report...");
    // Add report generation logic here
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Comprehensive insights into your fleet operations and business performance
          </p>
        </div>

        <Tabs defaultValue="pending-payments" className="space-y-8">
          <Card className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardContent className="p-6">
              <TabsList className="inline-flex h-12 items-center justify-start space-x-4 rounded-lg bg-muted/50 p-1">
                <TabsTrigger value="pending-payments">
                  <FileSpreadsheet className="h-5 w-5 mr-2" />
                  Pending Payments
                </TabsTrigger>
                <TabsTrigger value="vehicle-traffic-fines">
                  <FileSpreadsheet className="h-5 w-5 mr-2" />
                  Vehicle Traffic Fines
                </TabsTrigger>
                <TabsTrigger value="fleet">
                  <FileSpreadsheet className="h-5 w-5 mr-2" />
                  Fleet Analytics
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  Advanced Analytics
                </TabsTrigger>
                <TabsTrigger value="customer">
                  Customer Reports
                </TabsTrigger>
                <TabsTrigger value="operational">
                  Operational Reports
                </TabsTrigger>
                <TabsTrigger value="financial">
                  Financial Reports
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                  onClick={generateReport}
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-6">
            <TabsContent value="pending-payments">
              <PendingPaymentsReport />
            </TabsContent>
            
            <TabsContent value="vehicle-traffic-fines">
              <VehicleTrafficFinesReport />
            </TabsContent>
            
            <TabsContent value="fleet">
              <FleetAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="advanced">
              <AdvancedAnalytics />
            </TabsContent>

            <TabsContent value="customer">
              <CustomerReportSection 
                selectedReport={selectedReport}
                setSelectedReport={setSelectedReport}
                generateReport={generateReport}
              />
            </TabsContent>

            <TabsContent value="operational">
              <OperationalReportSection 
                selectedReport={selectedReport}
                setSelectedReport={setSelectedReport}
                generateReport={generateReport}
              />
            </TabsContent>

            <TabsContent value="financial">
              <FinancialReportSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
