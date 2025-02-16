
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Customer } from "@/components/customers/types/customer";

interface CreateCustomerProfileParams {
  full_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  driver_license?: string;
  id_document_url?: string;
  license_document_url?: string;
  contract_document_url?: string;
}

interface UseCreateCustomerProfileReturn {
  createProfile: (data: CreateCustomerProfileParams) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useCreateCustomerProfile(): UseCreateCustomerProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const createProfile = async (data: CreateCustomerProfileParams) => {
    setIsLoading(true);
    setError(null);

    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: Math.random().toString(36).slice(-8), // Generate a random password - you should modify this based on your requirements
        options: {
          data: {
            full_name: data.full_name,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Then create the profile record
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        address: data.address,
        driver_license: data.driver_license,
        id_document_url: data.id_document_url,
        license_document_url: data.license_document_url,
        contract_document_url: data.contract_document_url,
        role: "customer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "pending_review",
      });

      if (profileError) throw profileError;

      toast.success("Profile created successfully");
      navigate("/customer-portal");
    } catch (err) {
      const error = err as Error;
      console.error("Error creating profile:", error);
      setError(error);
      toast.error(error.message || "Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createProfile,
    isLoading,
    error,
  };
}
