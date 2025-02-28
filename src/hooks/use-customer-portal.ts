
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
          customer:customer_id (
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

      // First check if it's an error response from Supabase (happens with missing relations)
      if (data.customer && data.customer.error === true) {
        console.error("Customer relation error:", data.customer);
        toast.error("Customer information not found. Please contact support.");
        setIsLoading(false);
        return false;
      }

      // Safe access to customer data with proper type checking
      const customerData = data.customer;
      
      if (!customerData || typeof customerData !== 'object') {
        console.error("Invalid customer data:", customerData);
        toast.error("Customer profile data is incomplete. Please contact support.");
        setIsLoading(false);
        return false;
      }

      // Verify phone number matches
      if (!customerData.phone_number || customerData.phone_number !== phoneNumber) {
        toast.error("Phone number does not match our records.");
        setIsLoading(false);
        return false;
      }

      // Login successful
      toast.success("Login successful!");
      
      // Save session info
      const sessionData: CustomerPortalSession = {
        agreementId: data.id,
        customerId: data.customer_id,
        customerName: customerData.full_name || undefined,
        customerEmail: customerData.email || undefined,
        customerPhone: customerData.phone_number || undefined,
        agrNumber: data.agreement_number
      };
      
      // Save to state
      setActiveAgreementId(data.id);
      setCustomerId(data.customer_id);
      setCustomerName(customerData.full_name || null);
      setCustomerEmail(customerData.email || null);
      setCustomerPhone(customerData.phone_number || null);
      
      // Save to localStorage
      localStorage.setItem("customerPortalSession", JSON.stringify(sessionData));
      
      // Update login state
      setIsLoggedIn(true);
      
      console.log("Login successful, session saved:", sessionData);
      
      // Dispatch an event that the CustomerPortalLogin component can listen for
      const event = new CustomEvent('customerPortalLogin', { 
        detail: { 
          customerId: data.customer_id,
          agreementId: data.id
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
