
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResendOverview } from "./email/ResendDashboard/Overview";
import { TemplateList } from "./email/ResendDashboard/TemplateList";
import { TemplateRecommendations } from "./email/ResendDashboard/TemplateRecommendations";
import { AutomationRulesList } from "./email/AutomationRules/AutomationRulesList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmailMetricsDashboard } from "./email/EmailMetrics/EmailMetricsDashboard";
import { EmailSystemSettings } from "./email/EmailSystemSettings";
import { EnhancedEmailSettings } from "./email/EnhancedEmailSettings";
import { EmailOptOutManager } from "./email/EmailOptOutManager";

export const IntegrationSettings = () => {
  const [resendApiKey, setResendApiKey] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const testResendIntegration = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          templateId: 'test-template',
          recipientEmail: testEmail,
          recipientName: "Test User",
          variables: {
            customer: {
              full_name: "Test User",
              email: testEmail
            }
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test email sent successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Communication Services</CardTitle>
          <CardDescription>
            Configure your communication integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Resend</p>
                <p className="text-sm text-muted-foreground">Professional email delivery service</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="enhanced">Advanced Settings</TabsTrigger>
                <TabsTrigger value="opt-out">Opt-Out Manager</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <ResendOverview />
              </TabsContent>

              <TabsContent value="metrics">
                <EmailMetricsDashboard />
              </TabsContent>
              
              <TabsContent value="templates">
                <TemplateList />
              </TabsContent>

              <TabsContent value="automation">
                <AutomationRulesList />
              </TabsContent>
              
              <TabsContent value="system">
                <EmailSystemSettings />
              </TabsContent>

              <TabsContent value="enhanced">
                <EnhancedEmailSettings />
              </TabsContent>

              <TabsContent value="opt-out">
                <EmailOptOutManager />
              </TabsContent>

              <TabsContent value="recommendations">
                <TemplateRecommendations />
              </TabsContent>
              
              <TabsContent value="test">
                <div className="space-y-4 pt-4" dir="rtl">
                  <div>
                    <Input
                      type="text"
                      placeholder="أدخل البريد الإلكتروني للاختبار"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className={cn(
                        "max-w-sm text-right",
                        "placeholder:text-right"
                      )}
                    />
                  </div>
                  <Button 
                    onClick={testResendIntegration}
                    disabled={isTesting || !testEmail}
                    className="flex flex-row-reverse"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جارٍ الاختبار...
                      </>
                    ) : (
                      'اختبار الاتصال'
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
