import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SalesLead, LeadProgress } from "@/types/sales.types";

const customerFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  phone_number: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  nationality: z.string().min(2, {
    message: "Nationality must be at least 2 characters.",
  }),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CreateCustomerDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      email: "",
      nationality: "",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);

      // Create the customer profile first
      const { data: newCustomer, error: customerError } = await supabase
        .from('profiles')
        .insert({
          full_name: data.full_name,
          phone_number: data.phone_number,
          email: data.email,
          nationality: data.nationality,
          role: 'customer'
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Now create a sales lead with the new customer ID
      const { data: newLead, error: leadError } = await supabase
        .from('sales_leads')
        .insert({
          customer_id: newCustomer.id,
          full_name: data.full_name,
          phone_number: data.phone_number,
          email: data.email,
          status: 'new',
          onboarding_progress: {
            customer_conversion: false,
            agreement_creation: false,
            initial_payment: false
          }
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Convert the response to our frontend type with proper onboarding_progress typing
      const salesLead: SalesLead = {
        ...newLead,
        onboarding_progress: newLead.onboarding_progress as unknown as LeadProgress
      };

      toast.success("Customer created successfully");
      onClose();
      queryClient.invalidateQueries({ queryKey: ['customers'] });

    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error(error.message || "Failed to create customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Customer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" placeholder="John Doe" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input id="phone_number" placeholder="123-456-7890" {...register("phone_number")} />
            {errors.phone_number && (
              <p className="text-sm text-red-500">{errors.phone_number.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="johndoe@example.com" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input id="nationality" placeholder="American" {...register("nationality")} />
            {errors.nationality && (
              <p className="text-sm text-red-500">{errors.nationality.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Customer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
