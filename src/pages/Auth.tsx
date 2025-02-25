
import { AuthContainer } from "@/components/auth/AuthContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { UserRound, LogIn, Building2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  
  // Parse return URL from query parameters
  const params = new URLSearchParams(location.search);
  const returnUrl = params.get('returnUrl');

  useEffect(() => {
    if (session) {
      // If there's a return URL, navigate back to it after login
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate("/");
      }
    }
  }, [session, navigate, returnUrl]);

  // If user is trying to access a vehicle page, show a different message
  const isVehicleAccess = returnUrl?.startsWith('/vehicles/');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <Building2 className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isVehicleAccess ? 'Vehicle Information Access' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isVehicleAccess 
              ? 'Please sign in to view vehicle details and report issues'
              : 'Choose how you want to access the system'}
          </p>
        </div>

        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-6">
            <Button 
              variant="default" 
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-between gap-2 h-14 text-lg"
              onClick={() => navigate("/customer-portal")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-400 rounded-lg">
                  <UserRound className="w-5 h-5" />
                </div>
                <span>Customer Portal</span>
              </div>
              <ArrowRight className="w-5 h-5 opacity-70" />
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <LogIn className="w-5 h-5 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Staff & Admin Access</p>
              </div>
              <AuthContainer />
            </div>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
