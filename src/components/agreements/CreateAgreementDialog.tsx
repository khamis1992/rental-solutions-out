
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
import { AgreementTemplateSelect } from "./templates/AgreementTemplateSelect";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { FileText, Contract, User, Car, AlertCircle, PenLine } from "lucide-react";

interface CreateAgreementDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function CreateAgreementDialog({ open: controlledOpen, onOpenChange, children }: CreateAgreementDialogProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
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
    
    const shouldProcessPayment = window.confirm("Would you like to process the first payment now?");
    if (shouldProcessPayment) {
      navigate(`/agreements/${agreementId}?showPayment=true`);
    } else {
      navigate(`/agreements/${agreementId}`);
    }
  });

  // Pre-fill customer information if customerId is provided in URL
  useEffect(() => {
    const customerId = searchParams.get("customerId");
    if (customerId) {
      setSelectedCustomerId(customerId);
      setValue("customerId", customerId);

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

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 text-lg font-semibold mb-4">
      <Icon className="h-5 w-5 text-primary" />
      <h3>{title}</h3>
    </div>
  );

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

        <div className="mb-6">
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <ScrollArea className="max-h-[80vh] pr-4">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <SectionHeader icon={FileText} title="Agreement Template" />
              <AgreementTemplateSelect setValue={setValue} />
            </div>
            
            <Separator className="my-6" />
            
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <SectionHeader icon={Contract} title="Basic Agreement Information" />
              <AgreementBasicInfo register={register} errors={errors} watch={watch} />
            </div>
            
            <Separator className="my-6" />
            
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <SectionHeader icon={User} title="Customer Information" />
              <CustomerInformation 
                register={register} 
                errors={errors}
                selectedCustomerId={selectedCustomerId}
                onCustomerSelect={setSelectedCustomerId}
                setValue={setValue}
              />
            </div>
            
            <Separator className="my-6" />

            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <SectionHeader icon={Car} title="Vehicle Details" />
              <VehicleAgreementDetails 
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            </div>

            <Separator className="my-6" />

            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <SectionHeader icon={AlertCircle} title="Late Fees & Penalties" />
              <div className="grid grid-cols-2 gap-4">
                <LateFeesPenaltiesFields register={register} />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <SectionHeader icon={PenLine} title="Additional Notes" />
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes"
                  placeholder="Additional notes about the agreement..."
                  className="min-h-[100px]"
                  {...register("notes")} 
                />
              </div>
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
