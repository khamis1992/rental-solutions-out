
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export function PaymentSystemEmailTest() {
  const [email, setEmail] = useState("khamis-1992@hotmail.com");
  const [name, setName] = useState("Test User");
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleSendWelcomeEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setProgress(25);

    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          recipientEmail: email,
          recipientName: name || undefined,
          emailType: "welcome"
        }
      });

      setProgress(75);
      
      if (error) throw error;
      
      setProgress(100);
      
      toast({
        title: "Success",
        description: `Welcome email sent successfully to ${email}!`,
      });
    } catch (error: any) {
      console.error("Error sending welcome email:", error);
      toast({
        title: "Error",
        description: `Failed to send email: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsSending(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Payment System Email Test</CardTitle>
          <CardDescription>
            Send a welcome email explaining the standardized payment system (due on the 1st of each month)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">
                  This sends an email explaining the standardized payment system with payments due on the 1st of each month.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Recipient Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer Name"
            />
          </div>

          {isSending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sending email...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSendWelcomeEmail}
            disabled={isSending || !email}
            className="w-full"
          >
            {isSending ? "Sending..." : "Send Welcome Email"}
          </Button>
        </CardFooter>
      </Card>
    </ErrorBoundary>
  );
}
