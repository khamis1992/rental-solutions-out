
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerPortalSession {
  customerId: string;
  agreementId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  agrNumber?: string;
}

export const useCustomerPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [activeAgreementId, setActiveAgreementId] = useState<string | null>(null);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const portalSession = localStorage.getItem("customerPortalSession");
        if (portalSession) {
          const sessionData = JSON.parse(portalSession) as CustomerPortalSession;
          if (sessionData && sessionData.customerId && sessionData.agreementId) {
            console.log("Found existing session:", sessionData);
            setActiveAgreementId(sessionData.agreementId);
            setCustomerId(sessionData.customerId);
            setCustomerName(sessionData.customerName || null);
            setCustomerEmail(sessionData.customerEmail || null);
            setCustomerPhone(sessionData.customerPhone || null);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        localStorage.removeItem("customerPortalSession");
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Listen for login events
  useEffect(() => {
    const handleLoginEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ customerId: string; agreementId: string }>;
      console.log("Received customerPortalLogin event:", customEvent);
      
      if (customEvent.detail) {
        const { customerId, agreementId } = customEvent.detail;
        setCustomerId(customerId);
        setActiveAgreementId(agreementId);
        setIsLoggedIn(true);
      
        // Get other customer details from localStorage
        try {
          const sessionData = JSON.parse(localStorage.getItem("customerPortalSession") || "{}") as CustomerPortalSession;
          setCustomerName(sessionData.customerName || null);
          setCustomerEmail(sessionData.customerEmail || null);
          setCustomerPhone(sessionData.customerPhone || null);
        } catch (error) {
          console.error("Error parsing session data:", error);
        }
        
        // Redirect to customer portal
        setTimeout(() => {
          window.location.href = "/customer-portal";
        }, 500);
      }
    };

    window.addEventListener('customerPortalLogin', handleLoginEvent);
    
    return () => {
      window.removeEventListener('customerPortalLogin', handleLoginEvent);
    };
  }, []);

  const handleLogin = async (agrNumber: string, phoneNumber: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      console.log("Attempting to login with:", { agrNumber, phoneNumber });
      
      // Get agreement by agreement number
      const { data, error } = await supabase
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

      if (error || !data) {
        console.error("Agreement fetch error:", error);
        toast.error("Agreement not found. Please check your agreement number.");
        setIsLoading(false);
        return false;
      }

      console.log("Agreement found:", data);

      // Type safety handling for response data
      const agreementData = data as {
        id: string;
        agreement_number: string;
        customer_id: string;
        profiles: {
          id: string;
          full_name: string | null;
          phone_number: string | null;
          email: string | null;
        } | null;
      };

      // Handle potential issues with customer data
      if (!agreementData.profiles) {
        console.error("Invalid customer data:", agreementData.profiles);
        toast.error("Customer profile data is incomplete. Please contact support.");
        setIsLoading(false);
        return false;
      }

      // Verify phone number matches
      if (!agreementData.profiles.phone_number || agreementData.profiles.phone_number !== phoneNumber) {
        toast.error("Phone number does not match our records.");
        setIsLoading(false);
        return false;
      }

      // Login successful
      toast.success("Login successful!");
      
      // Save session info
      const sessionData: CustomerPortalSession = {
        agreementId: agreementData.id,
        customerId: agreementData.customer_id,
        customerName: agreementData.profiles.full_name || undefined,
        customerEmail: agreementData.profiles.email || undefined,
        customerPhone: agreementData.profiles.phone_number || undefined,
        agrNumber: agreementData.agreement_number
      };
      
      // Save to state
      setActiveAgreementId(agreementData.id);
      setCustomerId(agreementData.customer_id);
      setCustomerName(agreementData.profiles.full_name);
      setCustomerEmail(agreementData.profiles.email);
      setCustomerPhone(agreementData.profiles.phone_number);
      
      // Save to localStorage
      localStorage.setItem("customerPortalSession", JSON.stringify(sessionData));
      
      // Update login state
      setIsLoggedIn(true);
      
      console.log("Login successful, session saved:", sessionData);
      
      // Dispatch an event that the CustomerPortalLogin component can listen for
      const event = new CustomEvent('customerPortalLogin', { 
        detail: { 
          customerId: agreementData.customer_id,
          agreementId: agreementData.id
        }
      });
      window.dispatchEvent(event);
      
      // Force page redirect
      setTimeout(() => {
        window.location.href = "/customer-portal";
      }, 500);
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setIsLoggedIn(false);
    setActiveAgreementId(null);
    setCustomerId(null);
    setCustomerName(null);
    setCustomerEmail(null);
    setCustomerPhone(null);
    localStorage.removeItem("customerPortalSession");
    toast.info("You have been logged out.");
    
    // Redirect to login page
    window.location.href = "/customer-portal";
  };

  return {
    isLoggedIn,
    isLoading,
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    activeAgreementId,
    handleLogin,
    handleLogout
  };
};
