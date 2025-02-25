
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { toast } from "sonner";

export const useAuth = () => {
  const { session, isLoading, error } = useSessionContext();

  useEffect(() => {
    if (error) {
      console.error("Auth error:", error);
      toast.error("Authentication error occurred");
    }
  }, [error]);

  return { session, isLoading, error };
};
