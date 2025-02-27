
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { UserManagementSettings } from "@/components/settings/UserManagementSettings";
import { VehicleStatusSettings } from "@/components/settings/VehicleStatusSettings";
import { AgreementTemplateManagement } from "@/components/agreements/templates/AgreementTemplateManagement";
import { WordTemplateManagement } from "@/components/agreements/templates/WordTemplateManagement";
import { LoyaltyProgramSettings } from "@/components/settings/LoyaltyProgramSettings";
import { PaymentSystemEmailTest } from "@/components/payments/PaymentSystemEmailTest";
import { WhatsAppTemplateSettings } from "@/components/settings/WhatsAppTemplateSettings";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your application settings and preferences
          </p>
        </div>

        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="vehicle-status">Vehicle Status</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
            <TabsTrigger value="email-testing">Email Testing</TabsTrigger>
            <TabsTrigger value="whatsapp-templates">WhatsApp</TabsTrigger>
          </TabsList>
          
          <TabsContent value="integrations">
            <IntegrationSettings />
          </TabsContent>
          <TabsContent value="users">
            <UserManagementSettings />
          </TabsContent>
          <TabsContent value="vehicle-status">
            <VehicleStatusSettings />
          </TabsContent>
          <TabsContent value="templates">
            <div className="space-y-6">
              <AgreementTemplateManagement />
              <WordTemplateManagement />
            </div>
          </TabsContent>
          <TabsContent value="loyalty">
            <LoyaltyProgramSettings />
          </TabsContent>
          <TabsContent value="email-testing">
            <PaymentSystemEmailTest />
          </TabsContent>
          <TabsContent value="whatsapp-templates">
            <WhatsAppTemplateSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
