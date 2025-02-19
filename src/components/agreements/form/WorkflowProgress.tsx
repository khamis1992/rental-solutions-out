import { Button } from "@/components/ui/button";
import { CustomerInformation } from "@/components/agreements/form/CustomerInformation";
import { AgreementBasicInfo } from "@/components/agreements/form/AgreementBasicInfo";
import { VehicleAgreementDetails } from "@/components/agreements/form/VehicleAgreementDetails";
import { LateFeesPenaltiesFields } from "@/components/agreements/form/LateFeesPenaltiesFields";
import { Step } from "@/types/agreement.types";
import { UseFormReturn } from "react-hook-form";
import { AgreementFormData } from "../hooks/useAgreementForm";
import { AgreementTypeSelect } from "./AgreementTypeSelect";

interface WorkflowProgressProps {
  currentStep: Step;
  totalSteps: number;
  handleNext: () => void;
  handlePrevious: () => void;
  control: UseFormReturn<AgreementFormData>["control"];
  errors: UseFormReturn<AgreementFormData>["formState"]["errors"];
  register: UseFormReturn<AgreementFormData>["register"];
  watch: UseFormReturn<AgreementFormData>["watch"];
  isStepValid: boolean;
  isSubmitting: boolean;
}

export const WorkflowProgress = ({
  currentStep,
  totalSteps,
  handleNext,
  handlePrevious,
  control,
  errors,
  register,
  watch,
  isStepValid,
  isSubmitting,
}: WorkflowProgressProps) => {
  // Update the return statement to include the new styles
  return (
    <div className="space-y-6">
      <div className="dialog-content px-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <CustomerInformation control={control} errors={errors} />
            <AgreementBasicInfo control={control} errors={errors} />
            <AgreementTypeSelect register={register} />
          </div>
        )}
        {currentStep === 2 && (
          <VehicleAgreementDetails
            control={control}
            errors={errors}
            watch={watch}
          />
        )}
        {currentStep === 3 && (
          <LateFeesPenaltiesFields control={control} errors={errors} />
        )}
      </div>

      <div className="dialog-footer px-6 flex justify-between">
        {currentStep > 1 && (
          <Button type="button" variant="outline" onClick={handlePrevious}>
            Previous
          </Button>
        )}
        <Button
          type="button"
          onClick={handleNext}
          disabled={!isStepValid || isSubmitting}
        >
          {currentStep === totalSteps ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
};
