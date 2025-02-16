
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PreRegistrationFormData } from "@/types/pre-registration";

const preRegistrationSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(8, "Phone number must be at least 8 characters"),
  preferred_vehicle_type: z.string(),
  preferred_color: z.string(),
  budget_min: z.number().min(0),
  budget_max: z.number().min(0),
  preferred_installment_period: z.string(),
  comments: z.string(),
});

const vehicleTypes = [
  "Sedan",
  "SUV",
  "Luxury",
  "Sports",
  "Van",
  "Truck",
];

const installmentPeriods = [
  "12 months",
  "24 months",
  "36 months",
  "48 months",
  "60 months",
];

const colors = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Red",
  "Blue",
  "Other",
];

export function PreRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PreRegistrationFormData>({
    resolver: zodResolver(preRegistrationSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      preferred_vehicle_type: "",
      preferred_color: "",
      budget_min: 0,
      budget_max: 0,
      preferred_installment_period: "",
      comments: "",
    },
  });

  async function onSubmit(data: PreRegistrationFormData) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("pre_registrations")
        .insert([data]);

      if (error) throw error;

      toast.success("Pre-registration submitted successfully");
      form.reset();
    } catch (error) {
      console.error("Error submitting pre-registration:", error);
      toast.error("Failed to submit pre-registration");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferred_vehicle_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Vehicle Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferred_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Color</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Budget</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter minimum budget" 
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget_max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Budget</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter maximum budget" 
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferred_installment_period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Installment Period</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select installment period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {installmentPeriods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Comments</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any additional requirements or comments"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Pre-registration"}
        </Button>
      </form>
    </Form>
  );
}
