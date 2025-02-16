
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DollarSign, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GuidanceTooltip } from "@/components/guidance-tooltip";

const paymentSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function FirstPaymentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "",
    },
  });

  const onSubmit = async (values: PaymentFormValues) => {
    setIsSubmitting(true);
    try {
      // First store the payment record
      const { error: firstPaymentError } = await supabase.from("first_payments").insert({
        amount: parseFloat(values.amount),
      });

      if (firstPaymentError) throw firstPaymentError;

      // Process the payment through the Edge Function
      const { data: processedPayment, error: processError } = await supabase.functions.invoke(
        'payment-service',
        {
          body: {
            operation: 'process_payment',
            data: {
              leaseId: null, // This will be linked later in the flow
              amount: parseFloat(values.amount),
              paymentMethod: 'Cash', // Default to cash for now
              description: 'Initial payment',
              type: 'Initial'
            }
          }
        }
      );

      if (processError) throw processError;

      toast.success("Payment amount submitted successfully");
      form.reset();
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Failed to submit payment amount");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-xl py-8">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-bold">First Payment</CardTitle>
            <GuidanceTooltip
              content="This initial payment will be recorded and processed. You'll be able to link it to a lease agreement later."
              icon="help"
              variant="info"
            />
          </div>
          <CardDescription>
            Please enter the payment amount to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Payment Amount</FormLabel>
                      <GuidanceTooltip
                        content="Enter the amount received from the customer. This can be modified later if needed."
                        icon="info"
                      />
                    </div>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Submit Payment
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
