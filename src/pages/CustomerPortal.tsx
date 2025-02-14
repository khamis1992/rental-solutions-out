
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, Star, Gift, Shield, FileCheck } from "lucide-react";
import { PaymentHistory } from '@/components/customers/portal/PaymentHistory';
import { CustomerFeedback } from '@/components/customers/portal/CustomerFeedback';
import { ProfileManagement } from '@/components/customers/portal/ProfileManagement';
import { LoyaltyDashboard } from '@/components/customers/portal/LoyaltyDashboard';
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('handle_portal_login', {
        p_agreement_number: agreementNumber,
        p_phone_number: phoneNumber
      });

      if (error) throw error;

      const response = data as unknown as PortalLoginResponse;

      if (response.success) {
        setIsAuthenticated(true);
        const { data: agreementData } = await supabase
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
          .single();

        if (agreementData) {
          setProfile(agreementData.customer);
        }
        toast.success('Login successful');
      } else {
        toast.error(response.message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
      <div className="min-h-screen bg-background">
        <div className="container py-8 space-y-8">
          {/* Header with Logout Button */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary">Welcome, {profile?.full_name}</h1>
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm font-medium">Loyalty Points</p>
                </div>
                <h3 className="text-2xl font-bold mt-2">0</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Gift className="h-4 w-4 text-purple-500" />
                  <p className="text-sm font-medium">Available Rewards</p>
                </div>
                <h3 className="text-2xl font-bold mt-2">0</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <p className="text-sm font-medium">Tier Status</p>
                </div>
                <h3 className="text-2xl font-bold mt-2">Bronze</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <FileCheck className="h-4 w-4 text-green-500" />
                  <p className="text-sm font-medium">Active Rentals</p>
                </div>
                <h3 className="text-2xl font-bold mt-2">1</h3>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="loyalty">Loyalty & Rewards</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileManagement profile={profile} />
            </TabsContent>

            <TabsContent value="loyalty">
              <LoyaltyDashboard customerId={profile.id} />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentHistory customerId={profile.id} />
            </TabsContent>

            <TabsContent value="feedback">
              <CustomerFeedback agreementId={agreementNumber} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
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
              />
            </div>

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
