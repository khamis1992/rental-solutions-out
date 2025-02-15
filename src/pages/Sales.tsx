
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesOverview } from "@/components/sales/SalesOverview";
import { SalesLeadList } from "@/components/sales/SalesLeadList";
import { SalesPipeline } from "@/components/sales/SalesPipeline";
import { LeadScoring } from "@/components/sales/LeadScoring";
import { TeamPerformance } from "@/components/sales/TeamPerformance";
import { CreateLeadDialog } from "@/components/sales/CreateLeadDialog";
import { useSearchParams } from "react-router-dom";

const Sales = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sales Management</h1>
          <CreateLeadDialog />
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SalesOverview />
          </TabsContent>

          <TabsContent value="leads">
            <SalesLeadList />
          </TabsContent>

          <TabsContent value="onboarding">
            <SalesPipeline />
          </TabsContent>

          <TabsContent value="scoring">
            <LeadScoring />
          </TabsContent>

          <TabsContent value="team">
            <TeamPerformance />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Sales;
