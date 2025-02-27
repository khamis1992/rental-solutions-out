
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCustomerPortal } from "@/hooks/use-customer-portal";

interface CustomerPortalLoginProps {
  onLoginSuccess?: () => void;
}

export const CustomerPortalLogin = ({ onLoginSuccess }: CustomerPortalLoginProps) => {
  const [agrNumber, setAgrNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { isLoading, handleLogin } = useCustomerPortal();

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleLogin(agrNumber, phoneNumber);
    if (success && onLoginSuccess) {
      onLoginSuccess();
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
            className="w-full bg-primary" 
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
