
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VisitorAnalyticsDashboard } from "@/components/analytics/VisitorAnalyticsDashboard";

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Visitor Analytics</h1>
        <VisitorAnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
