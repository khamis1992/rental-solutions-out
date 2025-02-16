
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreRegistrationForm } from "@/components/sales/PreRegistrationForm";
import { Card } from "@/components/ui/card";
import { LeadListComponent } from "@/components/sales/lead-list-component";

export default function Sales() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <ErrorBoundary>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">Sales Management</h1>
            </div>

            <div className="mt-6">
              <Tabs defaultValue="leads" className="w-full">
                <TabsList>
                  <TabsTrigger value="pre-registration">Pre-registration</TabsTrigger>
                  <TabsTrigger value="leads">Leads</TabsTrigger>
                  <TabsTrigger value="deals">Deals</TabsTrigger>
                </TabsList>

                <TabsContent value="pre-registration" className="mt-6">
                  <Card className="p-6">
                    <h2 className="text-lg font-medium mb-4">New Pre-registration</h2>
                    <PreRegistrationForm />
                  </Card>
                </TabsContent>

                <TabsContent value="leads" className="mt-6">
                  <Card className="p-6">
                    <LeadListComponent />
                  </Card>
                </TabsContent>

                <TabsContent value="deals">
                  <Card className="p-6">
                    <p className="text-gray-500">Deals management coming soon...</p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}
