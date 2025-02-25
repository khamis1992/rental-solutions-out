
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
    console.log('ProtectedRoute state:', { user, loading, userRole, requireAuth, allowedRoles });
    
    if (!loading) {
      if (requireAuth && !user) {
        const returnUrl = `${location.pathname}${location.search}`;
        console.log('Redirecting to auth, no user found. Return URL:', returnUrl);
        navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
        toast.error("Please sign in to access this page");
      } else if (
        user && 
        allowedRoles.length > 0 && 
        userRole && 
        !allowedRoles.includes(userRole)
      ) {
        console.log('User does not have required role:', { userRole, allowedRoles });
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

  // If we require auth and there's no user, don't render anything
  // The useEffect above will handle the redirect
  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
};
