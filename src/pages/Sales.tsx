
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SalesOverview } from "@/components/sales/SalesOverview";
import { TeamPerformance } from "@/components/sales/TeamPerformance";
import { SalesPipeline } from "@/components/sales/SalesPipeline";
import { LeadScoring } from "@/components/sales/LeadScoring";
import { SalesLeadList } from "@/components/sales/SalesLeadList";
import { MasterSheet } from "@/components/sales/MasterSheet";

const Sales = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        <div className="grid gap-6">
          <SalesOverview />
          <TeamPerformance />
          <SalesPipeline />
          <LeadScoring />
          
          <h2 className="text-2xl font-semibold mt-6">Business Intelligence</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <SalesLeadList />
            </Card>
            <Card className="p-6">
              <MasterSheet />
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Sales;
