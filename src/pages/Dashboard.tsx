import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { BusinessHealth } from "@/components/dashboard/BusinessHealth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentReview } from "@/components/customers/DocumentReview";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <WelcomeHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DashboardStats />
          <QuickActions className="mt-6" />
        </div>
        <div>
          <DashboardAlerts />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Review</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentReview />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VehicleStatusChart />
        <BusinessHealth />
      </div>
    </div>
  );
}
