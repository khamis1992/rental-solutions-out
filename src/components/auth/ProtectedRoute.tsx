
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, profile, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Allow access to auth page
        if (window.location.pathname === "/auth") {
          return;
        }

        // If no session, redirect to auth with return URL
        if (!session?.user) {
          const currentPath = `${location.pathname}${location.search}`;
          navigate(`/auth?returnUrl=${encodeURIComponent(currentPath)}`);
          return;
        }

        // If there's an error or no profile, show error
        if (error || !profile) {
          console.error("Profile access error:", error);
          toast.error("Error accessing user profile");
          navigate("/auth");
          return;
        }

        // Special handling for vehicle routes - allow both staff and customers
        if (location.pathname.startsWith('/vehicles/')) {
          return;
        }

        // For customer portal access
        if (profile?.role === "customer" && window.location.pathname !== "/customer-portal") {
          navigate("/customer-portal");
        }
      } catch (error) {
        console.error("Error in checkAccess:", error);
        toast.error("An error occurred while checking user access");
        navigate("/auth");
      }
    };

    if (!isLoading) {
      checkAccess();
    }
  }, [session, profile, navigate, location, isLoading, error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};
