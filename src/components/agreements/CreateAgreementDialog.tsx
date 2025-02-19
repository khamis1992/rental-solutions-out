
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
import { WorkflowProgress } from "./form/WorkflowProgress";
import { useWorkflowProgress } from "./hooks/useWorkflowProgress";
import { LateFeesPenaltiesFields } from "./form/LateFeesPenaltiesFields";

export interface CreateAgreementDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  initialCustomerId?: string;
}

// Define steps constant
const steps = [
  { id: 'customer-info' as const, label: 'Customer Information' },
  { id: 'vehicle-details' as const, label: 'Vehicle Details' },
  { id: 'agreement-terms' as const, label: 'Agreement Terms' },
  { id: 'review' as const, label: 'Review & Submit' }
];

export function CreateAgreementDialog({ 
  open: controlledOpen, 
  onOpenChange, 
  children,
  initialCustomerId 
}: CreateAgreementDialogProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const { progress, completeStep, goToStep, debouncedSaveFormData, saveProgress } = useWorkflowProgress('create-agreement');

  const {
    open,
    setOpen,
    register,
    handleSubmit,
    onSubmit,
    watch,
    setValue,
    trigger,
    errors,
    isValid,
    isDirty
  } = useAgreementForm(async () => {
    setOpen(false);
    setSelectedCustomerId("");
    await queryClient.invalidateQueries({ queryKey: ["agreements"] });
    toast.success("Agreement created successfully");
  });

  // Set initial customer ID when provided
  useEffect(() => {
    if (initialCustomerId && !selectedCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }, [initialCustomerId]);

  // Watch for form changes and auto-save
  useEffect(() => {
    const subscription = watch((formData) => {
      debouncedSaveFormData(formData);
    });

    return () => subscription.unsubscribe();
  }, [watch, debouncedSaveFormData]);

  // Load saved form data when dialog opens
  useEffect(() => {
    const dialogOpen = controlledOpen !== undefined ? controlledOpen : open;
    if (dialogOpen && progress.formData) {
      Object.entries(progress.formData).forEach(([key, value]) => {
        setValue(key as any, value);
      });
    }
  }, [controlledOpen, open, progress.formData, setValue]);

  // Handle dialog open state
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedCustomerId("");
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setOpen(newOpen);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      // Clear the saved progress after successful submission
      await saveProgress({ 
        formData: {}, 
        completedSteps: [], 
        currentStep: 'customer-info',
        is_complete: true 
      });
    } catch (error) {
      console.error("Error creating agreement:", error);
      toast.error("Failed to create agreement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const currentIndex = steps.findIndex(s => s.id === progress.currentStep);
    const fieldsToValidate = {
      'customer-info': ['customerId', 'agreementType', 'rentAmount', 'agreementDuration'],
      'vehicle-details': ['vehicleId'],
      'agreement-terms': ['dailyLateFee'],
      'review': []
    }[progress.currentStep];

    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      completeStep(progress.currentStep);
      goToStep(steps[currentIndex + 1].id);
    } else {
      toast.error("Please fix the validation errors before proceeding");
    }
  };

  // Calculate dialog open state
  const isDialogOpen = controlledOpen !== undefined ? controlledOpen : open;

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
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

        <WorkflowProgress 
          currentStep={progress.currentStep}
          completedSteps={progress.completedSteps}
        />

        <ScrollArea className="max-h-[80vh] pr-4">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className={progress.currentStep !== 'customer-info' ? 'hidden' : ''}>
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
            </div>

            <div className={progress.currentStep !== 'vehicle-details' ? 'hidden' : ''}>
              <VehicleAgreementDetails 
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            </div>

            <div className={progress.currentStep !== 'agreement-terms' ? 'hidden' : ''}>
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
            </div>

            <div className={progress.currentStep !== 'review' ? 'hidden' : ''}>
              {/* Review section content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review Agreement Details</h3>
                {/* Add summary of all entered information */}
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-background pt-4">
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (progress.currentStep !== 'customer-info') {
                      const currentIndex = steps.findIndex(s => s.id === progress.currentStep);
                      goToStep(steps[currentIndex - 1].id);
                    }
                  }}
                  disabled={progress.currentStep === 'customer-info' || isSubmitting}
                >
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  {progress.currentStep === 'review' ? (
                    <Button 
                      type="submit"
                      disabled={isSubmitting || !isValid}
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
                  ) : (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
