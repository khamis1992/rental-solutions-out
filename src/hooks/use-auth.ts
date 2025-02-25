
import { useSessionContext } from "@supabase/auth-helpers-react";

export const useAuth = () => {
  const { session, isLoading } = useSessionContext();
  return { session, isLoading };
};
