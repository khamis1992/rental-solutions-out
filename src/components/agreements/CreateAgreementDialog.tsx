
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAgreementForm } from "./hooks/useAgreementForm";
import { LeaseToOwnFields } from "./form/LeaseToOwnFields";
import { LateFeesPenaltiesFields } from "./form/LateFeesPenaltiesFields";
import { useState, useEffect } from "react";
import { AgreementBasicInfo } from "./form/AgreementBasicInfo";
import { CustomerInformation } from "./form/CustomerInformation";
import { VehicleAgreementDetails } from "./form/VehicleAgreementDetails";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AgreementTemplateSelect } from "./form/AgreementTemplateSelect";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export interface CreateAgreementDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function CreateAgreementDialog({ open: controlledOpen, onOpenChange, children }: CreateAgreementDialogProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    open,
    setOpen,
    register,
    handleSubmit,
    onSubmit,
    agreementType,
    watch,
    setValue,
    errors,
  } = useAgreementForm(async (agreementId: string) => {
    setOpen(false);
    setSelectedCustomerId("");
    await queryClient.invalidateQueries({ queryKey: ["agreements"] });
    toast.success("Agreement created successfully");
    
    // Show payment processing prompt
    const shouldProcessPayment = window.confirm("Would you like to process the first payment now?");
    if (shouldProcessPayment) {
      navigate(`/agreements/${agreementId}/payments`);
    }
  });

  // Pre-fill customer information if customerId is provided in URL
  useEffect(() => {
    const customerId = searchParams.get("customerId");
    if (customerId) {
      setSelectedCustomerId(customerId);
      setValue("customerId", customerId);

      // Fetch and set customer details
      const fetchCustomerDetails = async () => {
        const { data: customer, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .single();

        if (error) {
          console.error('Error fetching customer:', error);
          return;
        }

        if (customer) {
          setValue("nationality", customer.nationality || '');
          setValue("drivingLicense", customer.driver_license || '');
          setValue("phoneNumber", customer.phone_number || '');
          setValue("email", customer.email || '');
          setValue("address", customer.address || '');
        }
      };

      fetchCustomerDetails();
    }
  }, [searchParams, setValue]);

  // Use controlled open state if provided
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const handleOpenChange = onOpenChange || setOpen;

  const handleFormSubmit = async (data: any) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error("Error creating agreement:", error);
      toast.error("Failed to create agreement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Agreement</DialogTitle>
          <DialogDescription>
            Create a new lease-to-own or short-term rental agreement.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <AgreementTemplateSelect setValue={setValue} />
            
            <Separator className="my-6" />
            
            <AgreementBasicInfo register={register} errors={errors} watch={watch} />
            
            <Separator className="my-6" />
            
            <CustomerInformation 
              register={register} 
              errors={errors}
              selectedCustomerId={selectedCustomerId}
              onCustomerSelect={setSelectedCustomerId}
              setValue={setValue}
            />
            
            <Separator className="my-6" />

            <VehicleAgreementDetails 
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Late Fees & Penalties</h3>
              <div className="grid grid-cols-2 gap-4">
                <LateFeesPenaltiesFields register={register} />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes"
                placeholder="Additional notes about the agreement..."
                className="min-h-[100px]"
                {...register("notes")} 
              />
            </div>

            <DialogFooter className="sticky bottom-0 bg-background pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="relative"
              >
                {isSubmitting ? (
                  <>
                    <span className="opacity-0">Create Agreement</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  </>
                ) : (
                  "Create Agreement"
                )}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
