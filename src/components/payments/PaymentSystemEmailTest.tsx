
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AlertCircle } from "lucide-react";

export function PaymentSystemEmailTest() {
  const [email, setEmail] = useState("khamis-1992@hotmail.com");
  const [name, setName] = useState("Test User");
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
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
    setErrorDetails(null);
    setResponseData(null);

    try {
      console.log("Sending email to:", email);
      
      // Invoke the Edge Function with additional debugging information in the response
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          recipientEmail: email,
          recipientName: name || undefined,
          emailType: "welcome"
        }
      });

      console.log("Response:", data, error);
      setResponseData(data);
      
      setProgress(75);
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Function error: ${error.message}`);
      }
      
      // Check for API error in the response
      if (data && data.error) {
        console.error("API error in response:", data.error);
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
      }
      
      setProgress(100);
      
      toast({
        title: "Success",
        description: `Welcome email sent successfully to ${email}!`,
      });
    } catch (error: any) {
      console.error("Error sending welcome email:", error);
      const errorMessage = error.message || "Unknown error";
      setErrorDetails(errorMessage);
      toast({
        title: "Error",
        description: `Failed to send email: ${errorMessage}`,
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

          {errorDetails && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Details</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{errorDetails}</p>
                    <p className="mt-2">Note: Make sure the RESEND_API_KEY is properly set in the Supabase Edge Functions settings. Go to Supabase Dashboard → Edge Functions → send-welcome-email → Environment Variables.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {responseData && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">API Response</h3>
                  <pre className="mt-2 text-xs text-green-700 overflow-auto max-h-32 p-2 bg-green-100 rounded">
                    {JSON.stringify(responseData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

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
