
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  allowedRoles = []
}: ProtectedRouteProps) => {
  const { user, loading, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Save the attempted URL
        const returnUrl = `${location.pathname}${location.search}`;
        navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
        toast.error("Please sign in to access this page");
      } else if (
        user && 
        allowedRoles.length > 0 && 
        userRole && 
        !allowedRoles.includes(userRole)
      ) {
        toast.error("You don't have permission to access this page");
        navigate("/");
      }
    }
  }, [user, loading, navigate, location, requireAuth, allowedRoles, userRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};
