
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session } = useSessionContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // Allow access to auth page
        if (window.location.pathname === "/auth") {
          setIsLoading(false);
          return;
        }

        // If no session, redirect to auth with return URL
        if (!session?.user) {
          const currentPath = `${location.pathname}${location.search}`;
          navigate(`/auth?returnUrl=${encodeURIComponent(currentPath)}`);
          setIsLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user role:", error);
          toast.error("Error fetching user profile");
          navigate("/auth");
          return;
        }

        setUserRole(profile?.role || null);

        // Special handling for vehicle routes - allow both staff and customers
        if (location.pathname.startsWith('/vehicles/')) {
          setIsLoading(false);
          return;
        }

        // For customer portal access
        if (profile?.role === "customer" && window.location.pathname !== "/customer-portal") {
          navigate("/customer-portal");
        }
      } catch (error) {
        console.error("Error in checkUserRole:", error);
        toast.error("An error occurred while checking user access");
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [session, navigate, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};
