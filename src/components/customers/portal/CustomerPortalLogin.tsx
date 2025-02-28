import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CustomerPortalLoginProps {
  onLoginSuccess?: (customerId: string, agreementId: string) => void;
  onLogin?: (agreementNumber: string, phoneNumber: string) => Promise<boolean>;
  isLoading?: boolean;
}

export const CustomerPortalLogin = ({ 
  onLoginSuccess, 
  onLogin,
  isLoading: externalIsLoading 
}: CustomerPortalLoginProps) => {
  const [agrNumber, setAgrNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    agreementNumber: "",
    phoneNumber: ""
  });
  
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
  
  const validateForm = () => {
    const errors = {
      agreementNumber: "",
      phoneNumber: ""
    };
    
    if (!agrNumber.trim()) {
      errors.agreementNumber = "Agreement number is required";
    } else if (agrNumber.length < 3) {
      errors.agreementNumber = "Please enter a valid agreement number";
    }
    
    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (phoneNumber.length < 8) {
      errors.phoneNumber = "Please enter a valid phone number";
    }
    
    setValidationErrors(errors);
    return !errors.agreementNumber && !errors.phoneNumber;
  };

  const handleDefaultLogin = async () => {
    if (!validateForm()) return false;
    
    setInternalIsLoading(true);
    
    try {
      console.log("Logging in with:", { agrNumber, phoneNumber });
      
      // First, get the agreement details
      const { data: agreementData, error: agreementError } = await supabase
        .from("leases")
        .select(`
          id, 
          agreement_number,
          customer_id,
          profiles:customer_id (
            id,
            full_name,
            phone_number,
            email
          )
        `)
        .eq("agreement_number", agrNumber)
        .single();
      
      if (agreementError || !agreementData) {
        console.error("Agreement fetch error:", agreementError);
        toast.error("Agreement not found. Please check your agreement number.");
        setInternalIsLoading(false);
        return false;
      }
      
      console.log("Agreement data:", agreementData);
      
      // Check if customer_id exists
      if (!agreementData.customer_id) {
        console.error("No customer_id found in agreement data");
        toast.error("Customer information not found. Please contact support.");
        setInternalIsLoading(false);
        return false;
      }
      
      // Check if profiles data exists and is valid
      if (!agreementData.profiles || typeof agreementData.profiles !== 'object') {
        console.error("Invalid profiles data:", agreementData.profiles);
        toast.error("Customer profile data is incomplete. Please contact support.");
        setInternalIsLoading(false);
        return false;
      }
      
      // Check if phone number matches
      if (agreementData.profiles.phone_number !== phoneNumber) {
        toast.error("Phone number does not match our records.");
        setInternalIsLoading(false);
        return false;
      }
      
      // Store in local storage for persistence
      const sessionData = {
        customerId: agreementData.customer_id,
        agreementId: agreementData.id,
        customerName: agreementData.profiles.full_name || "",
        customerEmail: agreementData.profiles.email || "",
        customerPhone: agreementData.profiles.phone_number || "",
        agrNumber: agreementData.agreement_number
      };
      
      localStorage.setItem("customerPortalSession", JSON.stringify(sessionData));
      
      // Login successful
      console.log("Login successful, session data saved:", sessionData);
      toast.success("Login successful!");
      
      // Call the onLoginSuccess callback if provided
      if (onLoginSuccess) {
        console.log("Calling onLoginSuccess with:", agreementData.customer_id, agreementData.id);
        onLoginSuccess(agreementData.customer_id, agreementData.id);
      }
      
      // Dispatch a global event for components that might not be directly connected
      const event = new CustomEvent('customerPortalLogin', { 
        detail: { 
          customerId: agreementData.customer_id,
          agreementId: agreementData.id
        }
      });
      console.log("Dispatching customerPortalLogin event");
      window.dispatchEvent(event);
      
      // Force reload the page to ensure state is refreshed
      window.location.reload();
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
      return false;
    } finally {
      setInternalIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If external onLogin handler is provided, use that
    if (onLogin) {
      if (validateForm()) {
        const success = await onLogin(agrNumber, phoneNumber);
        if (success) {
          console.log("External login successful");
          // The external handler should handle state changes
        }
      }
    } else {
      // Otherwise use the default login handler
      await handleDefaultLogin();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="agreementNumber">Agreement Number</Label>
        <Input 
          id="agreementNumber" 
          type="text" 
          placeholder="Enter your agreement number" 
          value={agrNumber}
          onChange={(e) => {
            setAgrNumber(e.target.value);
            if (validationErrors.agreementNumber) {
              setValidationErrors(prev => ({...prev, agreementNumber: ""}));
            }
          }}
          className={validationErrors.agreementNumber ? "border-destructive" : ""}
        />
        {validationErrors.agreementNumber && (
          <p className="text-destructive text-sm">{validationErrors.agreementNumber}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input 
          id="phoneNumber" 
          type="tel" 
          placeholder="Enter your phone number" 
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
            if (validationErrors.phoneNumber) {
              setValidationErrors(prev => ({...prev, phoneNumber: ""}));
            }
          }}
          className={validationErrors.phoneNumber ? "border-destructive" : ""}
        />
        {validationErrors.phoneNumber && (
          <p className="text-destructive text-sm">{validationErrors.phoneNumber}</p>
        )}
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
      <p className="text-center text-sm text-muted-foreground mt-2">
        Enter the agreement number and phone number associated with your account
      </p>
    </form>
  );
};
