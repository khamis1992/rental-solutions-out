
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface WorkflowStep {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed';
  component: React.ReactNode;
  canProceed: boolean;
}

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  currentStep: number;
  isPaused?: boolean;
}

export function WorkflowProgress({ steps, currentStep, isPaused }: WorkflowProgressProps) {
  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex flex-col items-center space-y-2",
              {
                "text-primary": step.status === 'completed',
                "text-muted-foreground": step.status === 'pending',
                "text-primary font-medium": step.status === 'active'
              }
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                {
                  "border-primary bg-primary text-primary-foreground": step.status === 'completed',
                  "border-muted": step.status === 'pending',
                  "border-primary": step.status === 'active'
                }
              )}
            >
              {index + 1}
            </div>
            <span className="text-sm text-center">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
