
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense, lazy } from "react";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card } from "@/components/ui/card";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BusinessHealth } from "@/components/dashboard/BusinessHealth";
import { SmartNotifications } from "@/components/dashboard/SmartNotifications";
import { useVisitorTracking } from "@/hooks/use-visitor-tracking";

const DashboardStats = lazy(() => import("@/components/dashboard/DashboardStats").then(module => ({ default: module.DashboardStats })));
const WelcomeHeader = lazy(() => import("@/components/dashboard/WelcomeHeader").then(module => ({ default: module.WelcomeHeader })));
const RecentActivity = lazy(() => import("@/components/dashboard/RecentActivity").then(module => ({ default: module.RecentActivity })));
const SystemChatbot = lazy(() => import("@/components/chat/SystemChatbot").then(module => ({ default: module.SystemChatbot })));

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
  useVisitorTracking();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 h-[56px] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50" />
        
        <div className="pt-[56px] pb-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl animate-fade-in">
            <div className="flex flex-col gap-6">
              <div className="w-full mt-6">
                <Card className="overflow-hidden bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-blue-900/10 border-none shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <ErrorBoundary>
                      <Suspense fallback={<ComponentLoader componentName="Welcome Header" />}>
                        <WelcomeHeader />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </Card>
              </div>

              <div className="w-full">
                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Dashboard Stats" />}>
                    <DashboardStats />
                  </Suspense>
                </ErrorBoundary>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <ErrorBoundary>
                  <BusinessHealth />
                </ErrorBoundary>

                <ErrorBoundary>
                  <SmartNotifications />
                </ErrorBoundary>
              </div>

              <ErrorBoundary>
                <QuickActions />
              </ErrorBoundary>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4">
                  <ErrorBoundary>
                    <Suspense fallback={<ComponentLoader componentName="Recent Activity" />}>
                      <RecentActivity />
                    </Suspense>
                  </ErrorBoundary>
                </div>
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <Suspense fallback={<ComponentLoader componentName="System Chatbot" />}>
                      <SystemChatbot />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;

