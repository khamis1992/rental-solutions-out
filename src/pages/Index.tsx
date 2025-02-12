
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense, lazy } from "react";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card } from "@/components/ui/card";
import { VehicleStatusList } from "@/components/dashboard/VehicleStatusList";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BusinessHealth } from "@/components/dashboard/BusinessHealth";
import { SmartNotifications } from "@/components/dashboard/SmartNotifications";

const DashboardStats = lazy(() => import("@/components/dashboard/DashboardStats"));
const WelcomeHeader = lazy(() => import("@/components/dashboard/WelcomeHeader"));
const RecentActivity = lazy(() => import("@/components/dashboard/RecentActivity"));
const SystemChatbot = lazy(() => import("@/components/chat/SystemChatbot"));

const ComponentLoader = ({ componentName }: { componentName: string }) => (
  <div className="w-full h-[200px] space-y-4 p-4">
    <div className="h-4 w-1/4">
      <Skeleton className="h-full w-full rounded-lg animate-pulse" />
    </div>
    <div className="h-[160px]">
      <Skeleton className="h-full w-full rounded-lg animate-pulse" />
    </div>
    <div className="text-sm text-muted-foreground text-center animate-fade-in">
      Loading {componentName}...
    </div>
  </div>
);

const Index = () => {
  usePerformanceMonitoring();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 animate-fade-in">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-blue-900/10 border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <ErrorBoundary fallback={<div>Error loading welcome header</div>}>
                <Suspense fallback={<ComponentLoader componentName="Welcome Header" />}>
                  <WelcomeHeader />
                </Suspense>
              </ErrorBoundary>
            </div>
          </Card>

          <ErrorBoundary fallback={<div>Error loading dashboard stats</div>}>
            <Suspense fallback={<ComponentLoader componentName="Dashboard Stats" />}>
              <DashboardStats />
            </Suspense>
          </ErrorBoundary>

          <div className="grid gap-6 md:grid-cols-2">
            <ErrorBoundary fallback={<div>Error loading business health</div>}>
              <BusinessHealth />
            </ErrorBoundary>

            <ErrorBoundary fallback={<div>Error loading notifications</div>}>
              <SmartNotifications />
            </ErrorBoundary>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <ErrorBoundary fallback={<div>Error loading vehicle status chart</div>}>
              <VehicleStatusChart />
            </ErrorBoundary>

            <ErrorBoundary fallback={<div>Error loading vehicle status list</div>}>
              <VehicleStatusList selectedStatus="all" />
            </ErrorBoundary>
          </div>

          <ErrorBoundary fallback={<div>Error loading quick actions</div>}>
            <QuickActions />
          </ErrorBoundary>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <ErrorBoundary fallback={<div>Error loading recent activity</div>}>
                <Suspense fallback={<ComponentLoader componentName="Recent Activity" />}>
                  <RecentActivity />
                </Suspense>
              </ErrorBoundary>
            </div>
            <div className="lg:col-span-3">
              <ErrorBoundary fallback={<div>Error loading system chatbot</div>}>
                <Suspense fallback={<ComponentLoader componentName="System Chatbot" />}>
                  <SystemChatbot />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
