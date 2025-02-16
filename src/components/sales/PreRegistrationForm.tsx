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
import { useVehicleTypes } from "@/components/hooks/useVehicleTypes";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

const vehicleTypesStatic = [
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
  const [isSuccess, setIsSuccess] = useState(false);
  const { vehicleTypes, isLoading: isLoadingVehicleTypes, isError } = useVehicleTypes();

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

      setIsSuccess(true);
      toast.success("Pre-registration submitted successfully");
      setTimeout(() => {
        setIsSuccess(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Error submitting pre-registration:", error);
      toast.error("Failed to submit pre-registration");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isError) {
    return (
      <div className="text-red-500 animate-fade-in">
        Error loading vehicle types. Please try again later.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className={cn(
          "space-y-6 transition-opacity duration-300",
          isSubmitting && "opacity-50 pointer-events-none",
          isSuccess && "opacity-0"
        )}
      >
        {isSubmitting && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {isSuccess && (
          <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-green-500 animate-scale-in" />
              <p className="text-lg font-medium">Registration Successful!</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form fields with animation classes */}
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="animate-fade-in">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter full name" 
                    {...field} 
                    className="transition-all duration-200 focus:scale-[1.02] focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="animate-fade-in [animation-delay:100ms]">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Enter email" 
                    {...field} 
                    className="transition-all duration-200 focus:scale-[1.02] focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem className="animate-fade-in [animation-delay:150ms]">
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter phone number" 
                    {...field} 
                    className="transition-all duration-200 focus:scale-[1.02] focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferred_vehicle_type"
            render={({ field }) => (
              <FormItem className="animate-fade-in [animation-delay:200ms]">
                <FormLabel>Preferred Vehicle Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="transition-all duration-200 focus:scale-[1.02] focus:border-primary">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingVehicleTypes ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : (
                      vehicleTypes.map((type) => (
                        <SelectItem 
                          key={type.id} 
                          value={type.name}
                          className="transition-colors hover:bg-primary/10"
                        >
                          {type.name}
                        </SelectItem>
                      ))
                    )}
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
              <FormItem className="animate-fade-in [animation-delay:250ms]">
                <FormLabel>Preferred Color</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="transition-all duration-200 focus:scale-[1.02] focus:border-primary">
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
              <FormItem className="animate-fade-in [animation-delay:300ms]">
                <FormLabel>Minimum Budget</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter minimum budget" 
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    className="transition-all duration-200 focus:scale-[1.02] focus:border-primary"
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
              <FormItem className="animate-fade-in [animation-delay:350ms]">
                <FormLabel>Maximum Budget</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter maximum budget" 
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    className="transition-all duration-200 focus:scale-[1.02] focus:border-primary"
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
              <FormItem className="animate-fade-in [animation-delay:400ms]">
                <FormLabel>Preferred Installment Period</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="transition-all duration-200 focus:scale-[1.02] focus:border-primary">
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
            <FormItem className="col-span-2 animate-fade-in [animation-delay:600ms]">
              <FormLabel>Additional Comments</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any additional requirements or comments"
                  className="min-h-[100px] transition-all duration-200 focus:scale-[1.02] focus:border-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="animate-fade-in [animation-delay:700ms] transition-all duration-200 hover:scale-[1.02]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </span>
          ) : "Submit Pre-registration"}
        </Button>
      </form>
    </Form>
  );
}
