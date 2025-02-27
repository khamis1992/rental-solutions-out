
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PaymentForm } from "@/components/agreements/details/PaymentForm";
import { useAgreementDetails } from "@/components/agreements/hooks/useAgreementDetails";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { VehicleInfoCard } from "@/components/agreements/details/VehicleInfoCard";
import { CustomerInfoCard } from "@/components/agreements/details/CustomerInfoCard";

export default function AgreementDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Redirect if no valid ID
  useEffect(() => {
    if (!id || id === "undefined") {
      navigate("/agreements");
      return;
    }
  }, [id, navigate]);

  // Only enable the query if we have a valid ID
  const { agreement, isLoading, error, refetch } = useAgreementDetails(id || "", !!id && id !== "undefined");

  // Show payment dialog if URL has showPayment=true
  useEffect(() => {
    if (searchParams.get("showPayment") === "true") {
      setShowPaymentDialog(true);
    }
  }, [searchParams]);

  if (!id || id === "undefined") {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Invalid Agreement</h2>
          <p className="text-gray-600">No agreement ID was provided. Redirecting to agreements list...</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-6 flex justify-center items-center min-h-[300px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait while we fetch the agreement details.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-6 min-h-[300px]">
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
            <p className="text-gray-600 mb-6">{error instanceof Error ? error.message : 'Failed to fetch agreement details'}</p>
            <Button onClick={() => refetch()} className="bg-primary">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Not Found</h2>
          <p className="text-gray-600">Agreement not found. Please check the agreement ID and try again.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Agreement Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CustomerInfoCard customer={agreement.customer || {}} />
        <VehicleInfoCard 
          vehicle={agreement.vehicle || {}} 
          initialMileage={agreement.initial_mileage || 0} 
        />
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Agreement Number</h3>
                <p>{agreement.agreement_number}</p>
              </div>
              <div>
                <h3 className="font-semibold">Start Date</h3>
                <p>{new Date(agreement.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold">End Date</h3>
                <p>{agreement.end_date ? new Date(agreement.end_date).toLocaleDateString() : 'Not set'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <p className="capitalize">{agreement.status}</p>
              </div>
              <div>
                <h3 className="font-semibold">Total Amount</h3>
                <p>{agreement.total_amount} QAR</p>
              </div>
              <div>
                <h3 className="font-semibold">Rent Amount</h3>
                <p>{agreement.rent_amount} QAR</p>
              </div>
              <div>
                <Button onClick={() => setShowPaymentDialog(true)} className="bg-primary">
                  Process Payment
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contract">
          <Card>
            <ScrollArea className="h-[60vh] w-full rounded-md border p-6">
              {agreement.processed_content ? (
                <div 
                  className="prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: agreement.processed_content }}
                />
              ) : (
                <p className="text-gray-500">No contract template content available</p>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Payment History</h3>
            {agreement.unified_payments && agreement.unified_payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agreement.unified_payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.amount} QAR
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.payment_method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {payment.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No payment history available</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm agreementId={agreement.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
