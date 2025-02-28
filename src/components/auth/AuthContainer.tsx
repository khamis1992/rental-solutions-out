
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Shield, LogIn } from "lucide-react";

export const AuthContainer = () => {
  const { isLoading, session } = useSessionContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (session) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Animated background elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <Card className={`w-full ${isMobile ? 'max-w-[95vw]' : 'max-w-md'} bg-white/90 backdrop-blur-sm shadow-xl rounded-xl border-0 overflow-hidden animate-scale-in z-10`}>
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex items-center gap-3">
            <Shield className="text-white h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold text-white">Rental Solutions</h1>
              <p className="text-purple-100 text-sm">Secure Account Access</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 mx-auto rounded-md animate-pulse" />
                <Skeleton className="h-4 w-1/2 mx-auto rounded-md animate-pulse" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
              </div>
            ) : (
              <>
                <div className="text-center space-y-2 animate-fade-in animation-delay-300">
                  <div className="inline-flex justify-center items-center p-2 bg-purple-100 rounded-full mb-2">
                    <LogIn className="h-6 w-6 text-purple-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                  <p className="text-gray-600 text-sm">Sign in to your account to continue</p>
                </div>
                
                <div className="animate-fade-in animation-delay-500">
                  <Auth
                    supabaseClient={supabase}
                    appearance={{
                      theme: ThemeSupa,
                      variables: {
                        default: {
                          colors: {
                            brand: '#9b87f5',
                            brandAccent: '#7E69AB',
                            inputBackground: 'white',
                            inputText: '#374151',
                            inputBorder: '#E5E7EB',
                            inputBorderHover: '#9b87f5',
                            inputBorderFocus: '#9b87f5',
                            dividerBackground: '#E5E7EB',
                          },
                          fonts: {
                            bodyFontFamily: `'Inter', sans-serif`,
                            buttonFontFamily: `'Inter', sans-serif`,
                            inputFontFamily: `'Inter', sans-serif`,
                            labelFontFamily: `'Inter', sans-serif`,
                          },
                          radii: {
                            borderRadiusButton: '0.75rem',
                            buttonBorderRadius: '0.75rem',
                            inputBorderRadius: '0.75rem',
                          },
                          space: {
                            inputPadding: '0.75rem',
                            buttonPadding: '0.75rem',
                          },
                          borderWidths: {
                            buttonBorderWidth: '1px',
                            inputBorderWidth: '1px',
                          },
                          fontSizes: {
                            baseBodySize: '0.875rem',
                            baseInputSize: '1rem',
                            baseLabelSize: '0.875rem',
                            baseButtonSize: '0.875rem',
                          },
                        }
                      },
                      className: {
                        container: 'w-full space-y-4',
                        button: 'w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:translate-y-[-1px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 min-h-[48px] touch-button',
                        input: 'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 min-h-[48px] text-base hover:border-purple-300',
                        label: 'text-sm font-medium text-gray-700 mb-1.5',
                        anchor: 'text-purple-600 hover:text-purple-700 transition-colors duration-200 hover:underline touch-target',
                        message: 'text-sm text-gray-600 rounded-lg p-3 bg-gray-50 border border-gray-100 mt-2',
                        divider: 'bg-gray-200 h-px my-6',
                      }
                    }}
                    providers={[]}
                    localization={{
                      variables: {
                        sign_in: {
                          email_label: 'Work Email',
                          password_label: 'Password',
                          button_label: 'Sign In to Dashboard',
                          loading_button_label: 'Signing in...',
                          social_provider_text: 'Sign in with',
                          link_text: ''  // Remove "Don't have an account? Sign up"
                        },
                        forgotten_password: {
                          link_text: '',  // Remove "Forgot your password?"
                          button_label: 'Send reset email',
                        }
                      }
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4 text-center text-sm text-gray-500 animate-fade-in animation-delay-700">
        <p>© {new Date().getFullYear()} Rental Solutions. All rights reserved.</p>
      </div>
    </div>
  );
};
