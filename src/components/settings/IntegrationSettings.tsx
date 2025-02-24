
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Mail, MessageSquare, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
          email: testEmail,
          name: "Test User"
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
          <CardTitle>Payment Integrations</CardTitle>
          <CardDescription>
            Connect your payment processing services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Stripe</p>
              <p className="text-sm text-muted-foreground">Process credit card payments</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication Services</CardTitle>
          <CardDescription>
            Configure your communication integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Resend</p>
                <p className="text-sm text-muted-foreground">Professional email delivery service</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Input
                  type="text"
                  placeholder="Enter test email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Button 
                onClick={testResendIntegration}
                disabled={isTesting || !testEmail}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Twilio</p>
              <p className="text-sm text-muted-foreground">SMS notification service</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>
            Manage your API keys and access tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">Production API Key</p>
                <p className="text-sm text-muted-foreground">Last used 2 days ago</p>
              </div>
              <Button variant="outline">Regenerate</Button>
            </div>
            <div className="bg-muted p-2 rounded-md">
              <code className="text-sm">••••••••••••••••</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
