
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkflowStep } from "../hooks/useWorkflowProgress";

interface WorkflowProgressProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
}

const steps: { id: WorkflowStep; label: string }[] = [
  { id: 'customer-info', label: 'Customer Information' },
  { id: 'vehicle-details', label: 'Vehicle Details' },
  { id: 'agreement-terms', label: 'Agreement Terms' },
  { id: 'review', label: 'Review & Submit' }
];

export function WorkflowProgress({ currentStep, completedSteps }: WorkflowProgressProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-200" />
      <div className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  isCompleted ? "border-blue-600 bg-blue-600 text-white" : 
                  isCurrent ? "border-blue-600 bg-white text-blue-600" :
                  "border-gray-300 bg-white text-gray-300"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-sm font-medium",
                  isCurrent ? "text-blue-600" :
                  isCompleted ? "text-gray-900" : "text-gray-500"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
