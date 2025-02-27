
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerPortalLoginProps {
  onLoginSuccess?: (agrNumber: string, customerId: string) => void;
}

export const CustomerPortalLogin = ({ onLoginSuccess }: CustomerPortalLoginProps) => {
  const [agrNumber, setAgrNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agrNumber || !phoneNumber) {
      toast.error("Please enter all required information");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, fetch the agreement by agreement number
      const { data: agreementData, error: agreementError } = await supabase
        .from("leases")
        .select("id, customer_id")
        .eq("agreement_number", agrNumber)
        .single();

      if (agreementError || !agreementData) {
        throw new Error("Agreement not found. Please check your agreement number.");
      }

      // Then fetch the customer to verify phone number
      const { data: customerData, error: customerError } = await supabase
        .from("profiles")
        .select("id, phone_number")
        .eq("id", agreementData.customer_id)
        .single();

      if (customerError || !customerData) {
        throw new Error("Customer information not found.");
      }

      // Verify phone number matches
      if (customerData.phone_number !== phoneNumber) {
        throw new Error("Phone number does not match our records.");
      }

      toast.success("Login successful!");
      
      if (onLoginSuccess) {
        onLoginSuccess(agrNumber, customerData.id);
      }
      
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Customer Portal</CardTitle>
        <p className="text-center text-muted-foreground">Enter your agreement details to login</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agreementNumber">Agreement Number</Label>
            <Input 
              id="agreementNumber" 
              type="text" 
              placeholder="Enter your agreement number" 
              value={agrNumber}
              onChange={(e) => setAgrNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input 
              id="phoneNumber" 
              type="tel" 
              placeholder="Enter your phone number" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
