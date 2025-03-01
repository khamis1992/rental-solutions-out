
/**
 * EnhancedCustomerProfile Component
 * 
 * This component displays a comprehensive customer profile with multiple information sections.
 * It fetches customer data from Supabase and presents it in an organized, tabbed interface.
 * 
 * The component provides a holistic view of customer information including basic details,
 * documents, credibility scores, payments, and other relevant information.
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerBasicInfo } from "./CustomerBasicInfo";
import { CustomerDocumentSection } from "./CustomerDocumentSection";
import { TrafficFinesSummary } from "./TrafficFinesSummary";
import { PaymentHistoryAnalysis } from "./PaymentHistoryAnalysis";
import { RentDueManagement } from "./RentDueManagement";
import { CustomerNotes } from "./CustomerNotes";
import { CredibilityScore } from "./CredibilityScore";
import { CreditAssessment } from "./CreditAssessment";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Props interface for the EnhancedCustomerProfile component
 * 
 * @property customerId - The ID of the customer to display
 */
interface EnhancedCustomerProfileProps {
  customerId: string;
}

/**
 * Component that displays a comprehensive customer profile with multiple sections
 * 
 * @param customerId - ID of the customer to display profile for
 */
export function EnhancedCustomerProfile({ customerId }: EnhancedCustomerProfileProps) {
  // ----- Section: Data Fetching -----
  // Fetch customer profile data from Supabase
  const { data: profile, isLoading } = useQuery({
    queryKey: ["customer-profile", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // ----- Section: Loading State -----
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ----- Section: Error State -----
  if (!profile) {
    return <div>Customer not found</div>;
  }

  // ----- Section: Profile Display -----
  return (
    <div className="space-y-6">
      {/* Customer information card with basic info and documents */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <CustomerBasicInfo profile={profile} />
            <CustomerDocumentSection profile={profile} />
          </div>
        </CardContent>
      </Card>

      {/* Customer assessment metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CredibilityScore customerId={customerId} />
        <CreditAssessment customerId={customerId} />
      </div>

      {/* Customer notes section */}
      <CustomerNotes customerId={customerId} />

      {/* Tabbed sections for different types of customer data */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="rentdue">Rent Due</TabsTrigger>
          <TabsTrigger value="fines">Traffic Fines</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <PaymentHistoryAnalysis customerId={customerId} />
        </TabsContent>

        <TabsContent value="rentdue" className="mt-4">
          <RentDueManagement customerId={customerId} />
        </TabsContent>

        <TabsContent value="fines" className="mt-4">
          <TrafficFinesSummary customerId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
