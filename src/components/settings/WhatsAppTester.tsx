
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function WhatsAppTester() {
  const [phoneNumber, setPhoneNumber] = useState("66707063");
  const [message, setMessage] = useState("This is a test message from your car rental system.");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const sendTestMessage = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsLoading(true);
    setSuccess(false);
    setError(false);

    try {
      console.log("Sending test WhatsApp message to:", phoneNumber);
      const response = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          phoneNumber: phoneNumber,
          message: message,
          messageType: "text"
        }
      });

      console.log("WhatsApp response:", response);

      if (response.error) {
        throw new Error(response.error.message || "Failed to send message");
      }

      toast.success("Test message sent successfully!");
      setSuccess(true);
    } catch (err) {
      console.error("Error sending WhatsApp message:", err);
      toast.error(err.message || "Failed to send WhatsApp message");
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send Test WhatsApp Message</CardTitle>
        <CardDescription>
          Test your WhatsApp integration by sending a message
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number (e.g. 66707063)"
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Enter the phone number without country code. Qatar (+974) will be added automatically.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a test message"
              rows={3}
              className="w-full"
            />
          </div>

          <EnhancedButton
            onClick={sendTestMessage}
            loading={isLoading}
            success={success}
            error={error}
            successText="Message Sent!"
            errorText="Failed to Send"
            className="mt-4"
          >
            Send Test Message
          </EnhancedButton>
        </div>
      </CardContent>
    </Card>
  );
}
