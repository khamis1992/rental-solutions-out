
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const AuthContainer = () => {
  const { isLoading, session } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: '#F97316',
              brandAccent: '#EA580C',
              inputBackground: 'white',
              inputText: '#374151',
              inputBorder: '#E5E7EB',
              inputBorderHover: '#F97316',
              inputBorderFocus: '#F97316',
            },
            fonts: {
              bodyFontFamily: `'Inter', sans-serif`,
              buttonFontFamily: `'Inter', sans-serif`,
              inputFontFamily: `'Inter', sans-serif`,
              labelFontFamily: `'Inter', sans-serif`,
            },
            radii: {
              borderRadiusButton: '0.5rem',
              buttonBorderRadius: '0.5rem',
              inputBorderRadius: '0.5rem',
            },
          }
        },
        className: {
          container: 'w-full',
          button: 'w-full px-4 py-2.5 rounded-lg font-medium transition-colors',
          input: 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20',
          label: 'text-sm font-medium text-gray-700 mb-1',
          anchor: 'text-orange-600 hover:text-orange-700 transition-colors',
          message: 'text-sm text-gray-600',
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
            link_text: ''
          },
          sign_up: {
            email_label: 'Work Email',
            password_label: 'Password',
            button_label: 'Create Account',
            loading_button_label: 'Creating account...',
            link_text: 'Don\'t have an account? Sign up',
          },
          forgotten_password: {
            link_text: '',
            button_label: 'Send reset email',
          }
        }
      }}
    />
  );
};
