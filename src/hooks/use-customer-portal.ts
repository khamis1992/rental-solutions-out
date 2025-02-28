
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomerPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
          const sessionData = JSON.parse(portalSession);
          if (sessionData && sessionData.agreementId && sessionData.customerId) {
            console.log("Found existing session:", sessionData);
            setActiveAgreementId(sessionData.agreementId);
            setCustomerId(sessionData.customerId || "");
            setCustomerName(sessionData.customerName || "");
            setCustomerEmail(sessionData.customerEmail || "");
            setCustomerPhone(sessionData.customerPhone || "");
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        localStorage.removeItem("customerPortalSession");
      }
    };

    checkExistingSession();
  }, []);

  // Listen for login events
  useEffect(() => {
    const handleLoginEvent = (event: CustomEvent<{ customerId: string; agreementId: string }>) => {
      console.log("Received customerPortalLogin event:", event);
      const { customerId, agreementId } = event.detail;
      setCustomerId(customerId);
      setActiveAgreementId(agreementId);
      setIsLoggedIn(true);
      
      // Get other customer details from localStorage
      try {
        const sessionData = JSON.parse(localStorage.getItem("customerPortalSession") || "{}");
        setCustomerName(sessionData.customerName || null);
        setCustomerEmail(sessionData.customerEmail || null);
        setCustomerPhone(sessionData.customerPhone || null);
      } catch (error) {
        console.error("Error parsing session data:", error);
      }
    };

    window.addEventListener('customerPortalLogin', handleLoginEvent as EventListener);
    
    return () => {
      window.removeEventListener('customerPortalLogin', handleLoginEvent as EventListener);
    };
  }, []);

  const handleLogin = async (agrNumber: string, phoneNumber: string) => {
    setIsLoading(true);

    try {
      console.log("Attempting to login with:", { agrNumber, phoneNumber });
      
      // Get agreement by agreement number
      const { data: agreementData, error: agreementError } = await supabase
        .from("leases")
        .select(`
          id,
          agreement_number,
          customer_id,
          profiles(
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
        setIsLoading(false);
        return false;
      }

      console.log("Agreement found:", agreementData);

      // Handle potential issues with profiles data
      if (!agreementData.profiles || typeof agreementData.profiles === 'string') {
        console.error("Invalid profiles data:", agreementData.profiles);
        toast.error("Customer profile data is incomplete. Please contact support.");
        setIsLoading(false);
        return false;
      }

      // Verify phone number matches
      const customerProfile = agreementData.profiles;
      
      if (!customerProfile || !customerProfile.phone_number || customerProfile.phone_number !== phoneNumber) {
        toast.error("Phone number does not match our records.");
        setIsLoading(false);
        return false;
      }

      // Login successful
      toast.success("Login successful!");
      
      // Save session info
      const sessionData = {
        agreementId: agreementData.id,
        customerId: agreementData.customer_id,
        customerName: customerProfile.full_name || null,
        customerEmail: customerProfile.email || null,
        customerPhone: customerProfile.phone_number || null
      };
      
      // Save to state
      setActiveAgreementId(agreementData.id);
      setCustomerId(agreementData.customer_id);
      setCustomerName(customerProfile.full_name || null);
      setCustomerEmail(customerProfile.email || null);
      setCustomerPhone(customerProfile.phone_number || null);
      
      // Save to localStorage
      localStorage.setItem("customerPortalSession", JSON.stringify(sessionData));
      
      // Update login state
      setIsLoggedIn(true);
      
      console.log("Login successful, session saved:", sessionData);
      
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
