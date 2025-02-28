
import React, { useEffect, useState } from "react";
import { useCustomerPortal } from "@/hooks/use-customer-portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { EnhancedButton } from "@/components/ui/enhanced-button";

const PortalTest = () => {
  const [agreementNumber, setAgreementNumber] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState(false);
  const { 
    isLoggedIn, 
    isLoading, 
    customerId, 
    customerName, 
    customerEmail, 
    customerPhone, 
    activeAgreementId, 
    handleLogin, 
    handleLogout 
  } = useCustomerPortal();

  useEffect(() => {
    // Log portal state
    console.log("Customer Portal State:", {
      isLoggedIn,
      isLoading,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      activeAgreementId
    });
  }, [isLoggedIn, isLoading, customerId, customerName, customerEmail, customerPhone, activeAgreementId]);

  const attemptLogin = async () => {
    if (!agreementNumber || !phoneNumber) {
      toast.error("Please provide both agreement number and phone number");
      return;
    }
    
    setLoginLoading(true);
    console.log("Attempting login with:", { agreementNumber, phoneNumber });
    
    try {
      const success = await handleLogin(agreementNumber, phoneNumber);
      
      if (success) {
        toast.success("Login successful!");
        console.log("Login successful!");
      } else {
        toast.error("Login failed. Please check your credentials.");
        console.log("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Customer Portal Test Page</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Portal Status</CardTitle>
          <CardDescription>Current state of the customer portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Login Status:</strong> {isLoggedIn ? "Logged In" : "Logged Out"}</p>
            <p><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</p>
            <p><strong>Customer ID:</strong> {customerId || "N/A"}</p>
            <p><strong>Customer Name:</strong> {customerName || "N/A"}</p>
            <p><strong>Customer Email:</strong> {customerEmail || "N/A"}</p>
            <p><strong>Customer Phone:</strong> {customerPhone || "N/A"}</p>
            <p><strong>Active Agreement ID:</strong> {activeAgreementId || "N/A"}</p>
          </div>
        </CardContent>
        <CardFooter>
          {isLoggedIn ? (
            <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
          ) : (
            <Button variant="secondary" disabled>Not Logged In</Button>
          )}
        </CardFooter>
      </Card>

      {!isLoggedIn && (
        <Card>
          <CardHeader>
            <CardTitle>Login to Portal</CardTitle>
            <CardDescription>Enter your agreement number and phone number to log in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="agreementNumber" className="text-sm font-medium">Agreement Number</label>
                <Input
                  id="agreementNumber"
                  value={agreementNumber}
                  onChange={(e) => setAgreementNumber(e.target.value)}
                  placeholder="e.g. AGR-202502-0001"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +974 12345678"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <EnhancedButton 
              onClick={attemptLogin} 
              loading={loginLoading || isLoading}
              loadingText="Logging in..."
            >
              Login to Portal
            </EnhancedButton>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default PortalTest;
