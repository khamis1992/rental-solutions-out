
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesOverview } from "@/components/sales/SalesOverview";
import { SalesLeadList } from "@/components/sales/SalesLeadList";
import { SalesPipeline } from "@/components/sales/SalesPipeline";
import { LeadScoring } from "@/components/sales/LeadScoring";
import { TeamPerformance } from "@/components/sales/TeamPerformance";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateLeadDialog } from "@/components/sales/CreateLeadDialog";
import { MasterSheet } from "@/components/sales/MasterSheet";

const Sales = () => {
  const [createLeadOpen, setCreateLeadOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sales Management</h1>
          <Button onClick={() => setCreateLeadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="master">Business Intelligence</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SalesOverview />
          </TabsContent>

          <TabsContent value="leads">
            <SalesLeadList />
          </TabsContent>

          <TabsContent value="pipeline">
            <SalesPipeline />
          </TabsContent>

          <TabsContent value="scoring">
            <LeadScoring />
          </TabsContent>

          <TabsContent value="team">
            <TeamPerformance />
          </TabsContent>

          <TabsContent value="master">
            <div className="grid gap-6">
              <MasterSheet />
            </div>
          </TabsContent>
        </Tabs>

        <CreateLeadDialog open={createLeadOpen} onOpenChange={setCreateLeadOpen} />
      </div>
    </DashboardLayout>
  );
};

export default Sales;
