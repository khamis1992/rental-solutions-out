import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  agreement_name: z.string().min(2, "Agreement name must be at least 2 characters"),
  first_payment_amount: z.number().min(0, "Amount must be positive"),
});

export default function SalesOnboarding() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agreement_name: "",
      first_payment_amount: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Update lead status and create onboarding record
      const { error: updateError } = await supabase
        .from("sales_leads")
        .update({
          status: "in_onboarding",
          onboarding_date: new Date().toISOString(),
          onboarding_progress: {
            initial_payment: true,
            agreement_creation: true,
            customer_conversion: false,
          },
        })
        .eq("id", leadId);

      if (updateError) throw updateError;

      // Create record in unified_payments for first payment
      const { error: paymentError } = await supabase
        .from("unified_payments")
        .insert([
          {
            lease_id: null, // Will be updated when agreement is created
            amount: values.first_payment_amount,
            amount_paid: values.first_payment_amount,
            payment_date: new Date().toISOString(),
            status: "completed",
            type: "ONBOARDING_PAYMENT",
            description: `Initial payment for agreement: ${values.agreement_name}`,
          },
        ]);

      if (paymentError) throw paymentError;

      toast.success("Onboarding started successfully");
      navigate("/sales");
    } catch (error) {
      toast.error("Error starting onboarding");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl animate-fade-in">
      <div className="bg-card rounded-lg border p-6">
        <h1 className="text-3xl font-bold mb-6">Sales Onboarding</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="agreement_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agreement Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="first_payment_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Payment Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/sales")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Start Onboarding"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
