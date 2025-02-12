
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, ArrowLeft } from "lucide-react";
import { PaymentHistory } from '@/components/customers/portal/PaymentHistory';
import { CustomerFeedback } from '@/components/customers/portal/CustomerFeedback';
import { ProfileManagement } from '@/components/customers/portal/ProfileManagement';
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";

interface PortalLoginResponse {
  success: boolean;
  message?: string;
  user?: {
    agreement_number: string;
    status: string;
  };
}

export default function CustomerPortal() {
  const [agreementNumber, setAgreementNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('handle_portal_login', {
        p_agreement_number: agreementNumber,
        p_phone_number: phoneNumber
      });

      if (error) throw error;

      const response = data as unknown as PortalLoginResponse;

      if (response.success) {
        const { data: agreementData, error: profileError } = await supabase
          .from('leases')
          .select(`
            *,
            customer:customer_id (
              id,
              full_name,
              phone_number,
              email,
              address,
              nationality
            )
          `)
          .eq('agreement_number', agreementNumber)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!agreementData?.customer) {
          throw new Error('Customer profile not found');
        }

        setProfile(agreementData.customer);
        setIsAuthenticated(true);
        toast.success('Login successful');
      } else {
        setError(response.message || 'Invalid credentials');
        toast.error(response.message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setProfile(null);
    setAgreementNumber('');
    setPhoneNumber('');
    toast.success('Logged out successfully');
    navigate('/customer-portal');
  };

  if (isAuthenticated && profile) {
    return (
      <div className="min-h-screen bg-background-alt">
        <div className="container py-8 space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-secondary">Welcome, {profile?.full_name}</h1>
              <p className="text-muted-foreground">Manage your rentals and account details</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>

          <ErrorBoundary fallback={<Card className="p-6">Error loading profile</Card>}>
            <ProfileManagement profile={profile} />
          </ErrorBoundary>

          {profile?.id && (
            <ErrorBoundary fallback={<Card className="p-6">Error loading payment history</Card>}>
              <PaymentHistory customerId={profile.id} />
            </ErrorBoundary>
          )}

          <ErrorBoundary fallback={<Card className="p-6">Error loading feedback form</Card>}>
            <CustomerFeedback agreementId={agreementNumber} />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-alt p-4">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4"
          onClick={() => navigate('/auth')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <CardHeader>
          <CardTitle className="text-center">Customer Portal Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agreementNumber">Agreement Number</Label>
              <Input
                id="agreementNumber"
                placeholder="Enter your agreement number"
                value={agreementNumber}
                onChange={(e) => setAgreementNumber(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
