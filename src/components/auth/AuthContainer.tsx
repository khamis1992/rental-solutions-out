
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const AuthContainer = () => {
  const { isLoading, session } = useSessionContext();
  const navigate = useNavigate();

  if (session) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4 mx-auto rounded-md" />
        <Skeleton className="h-4 w-1/2 mx-auto rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
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
              baseInputSize: '0.875rem',
              baseLabelSize: '0.875rem',
              baseButtonSize: '0.875rem',
            },
          }
        },
        className: {
          container: 'w-full space-y-4',
          button: 'w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:translate-y-[-1px]',
          input: 'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all duration-200',
          label: 'text-sm font-medium text-gray-700 mb-1.5',
          anchor: 'text-orange-600 hover:text-orange-700 transition-colors duration-200 hover:underline',
          message: 'text-sm text-gray-600 rounded-lg p-2 bg-gray-50 border border-gray-100',
          divider: 'bg-gray-200 h-px',
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
  );
};
