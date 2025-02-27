
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";

interface SadadPaymentFormProps {
  agreementId: string;
  customerId: string;
  customerEmail?: string;
  customerPhone?: string;
  amount: number;
}

export const SadadPaymentForm = ({
  agreementId,
  customerId,
  customerEmail = "",
  customerPhone = "",
  amount
}: SadadPaymentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentData, setPaymentData] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for payment callback in URL
  const searchParams = new URLSearchParams(location.search);
  const isCallback = searchParams.get('payment') === 'callback';
  const orderId = searchParams.get('orderId');
  const txStatus = searchParams.get('STATUS');

  // Handle payment callback
  useEffect(() => {
    if (isCallback && orderId) {
      setPaymentStatus(txStatus === 'TXN_SUCCESS' ? 'success' : txStatus === 'TXN_FAILURE' ? 'error' : 'idle');
      
      // Clear URL parameters after handling
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      if (txStatus === 'TXN_SUCCESS') {
        toast.success("Payment completed successfully!");
      } else if (txStatus === 'TXN_FAILURE') {
        toast.error("Payment failed. Please try again.");
      }
    }
  }, [isCallback, orderId, txStatus]);

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStatus('processing');
    
    try {
      const { data, error } = await supabase.functions.invoke('process-sadad-payment/process', {
        body: {
          leaseId: agreementId,
          customerId,
          amount,
          customerEmail,
          customerPhone
        }
      });

      if (error) {
        console.error("Error initiating payment:", error);
        toast.error("Failed to initiate payment");
        setPaymentStatus('error');
        return;
      }

      if (data.success) {
        setPaymentData(data.paymentData);
        
        // Submit form to Sadad
        submitSadadForm(data.paymentData);
      } else {
        toast.error(data.error || "Failed to initiate payment");
        setPaymentStatus('error');
      }
    } catch (err) {
      console.error("Error in payment process:", err);
      toast.error("An unexpected error occurred");
      setPaymentStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const submitSadadForm = (formData: any) => {
    // Create a hidden form and submit it
    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://sadadqa.com/webpurchase';
    form.id = 'sadad_payment_form';
    form.name = 'gosadad';
    form.style.display = 'none';

    // Add the standard fields
    const fields = [
      { name: 'merchant_id', value: formData.merchant_id },
      { name: 'ORDER_ID', value: formData.ORDER_ID },
      { name: 'WEBSITE', value: formData.WEBSITE },
      { name: 'TXN_AMOUNT', value: formData.TXN_AMOUNT },
      { name: 'CUST_ID', value: formData.CUST_ID },
      { name: 'EMAIL', value: formData.EMAIL },
      { name: 'MOBILE_NO', value: formData.MOBILE_NO },
      { name: 'SADAD_WEBCHECKOUT_PAGE_LANGUAGE', value: formData.SADAD_WEBCHECKOUT_PAGE_LANGUAGE },
      { name: 'VERSION', value: formData.VERSION },
      { name: 'CALLBACK_URL', value: formData.CALLBACK_URL },
      { name: 'txnDate', value: formData.txnDate },
      { name: 'checksumhash', value: formData.checksumhash }
    ];

    // Add product details
    if (formData.productdetail && formData.productdetail.length > 0) {
      formData.productdetail.forEach((product: any, index: number) => {
        Object.entries(product).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = `productdetail[${index}][${key}]`;
          input.value = value as string;
          form.appendChild(input);
        });
      });
    }

    // Add all fields to the form
    fields.forEach(field => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = field.name;
      input.value = field.value;
      form.appendChild(input);
    });

    // Append form to body and submit
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <Card className="mb-4">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-lg font-medium">Make a Payment</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          <p className="text-muted-foreground mb-2">Payment Amount</p>
          <p className="text-xl font-semibold">{formatCurrency(amount)}</p>
        </div>

        {paymentStatus === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h4 className="font-medium text-green-800">Payment Successful</h4>
              <p className="text-green-700 text-sm">Your payment has been processed successfully.</p>
            </div>
          </div>
        ) : paymentStatus === 'error' ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h4 className="font-medium text-red-800">Payment Failed</h4>
              <p className="text-red-700 text-sm">There was an issue processing your payment. Please try again.</p>
            </div>
          </div>
        ) : (
          <Button 
            onClick={handlePayment} 
            disabled={isLoading} 
            className="w-full bg-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay Now with Sadad"
            )}
          </Button>
        )}
        
        {paymentStatus === 'error' && (
          <Button 
            onClick={handlePayment} 
            className="w-full mt-4 bg-primary"
          >
            Try Again
          </Button>
        )}
        
        <div className="mt-4 text-xs text-center text-muted-foreground">
          <p>You will be redirected to the Sadad payment gateway to complete your payment.</p>
        </div>
      </CardContent>
    </Card>
  );
};
