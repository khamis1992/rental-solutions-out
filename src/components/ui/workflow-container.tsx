
import { useState, useEffect } from "react";
import { WorkflowProgress, WorkflowStep } from "./workflow-progress";
import { Button } from "./button";
import { Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { useHotkeys } from "react-hotkeys-hook";

interface WorkflowContainerProps {
  steps: WorkflowStep[];
  onComplete?: () => void;
  showTour?: boolean;
}

export function WorkflowContainer({ steps, onComplete, showTour = true }: WorkflowContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [tourComplete, setTourComplete] = useState(false);
  
  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('workflowProgress');
    if (savedProgress) {
      const { step, paused } = JSON.parse(savedProgress);
      setCurrentStep(step);
      setIsPaused(paused);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('workflowProgress', JSON.stringify({
      step: currentStep,
      paused: isPaused
    }));
  }, [currentStep, isPaused]);

  // Keyboard shortcuts
  useHotkeys('ctrl+right', () => handleNext(), { enabled: !isPaused });
  useHotkeys('ctrl+left', () => handlePrevious(), { enabled: !isPaused });
  useHotkeys('space', () => togglePause(), { preventDefault: true });
  useHotkeys('esc', () => setIsPaused(true));

  const togglePause = () => {
    setIsPaused(prev => !prev);
    toast(isPaused ? "Workflow resumed" : "Workflow paused");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && !isPaused) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === steps.length - 1) {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0 && !isPaused) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Show keyboard shortcuts tooltip on first visit
  useEffect(() => {
    const hasSeenTips = localStorage.getItem('hasSeenKeyboardShortcuts');
    if (!hasSeenTips && !tourComplete) {
      toast.info(
        "Keyboard Shortcuts Available!", 
        {
          description: "Use Ctrl + ← → to navigate, Space to pause/resume, Esc to pause",
          duration: 5000,
        }
      );
      localStorage.setItem('hasSeenKeyboardShortcuts', 'true');
    }
  }, [tourComplete]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <WorkflowProgress
          steps={steps}
          currentStep={currentStep}
          isPaused={isPaused}
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={togglePause}
          className="ml-4"
        >
          {isPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className={cn(
        "transition-opacity duration-200",
        isPaused && "opacity-50 pointer-events-none"
      )}>
        {steps[currentStep]?.component}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isPaused}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!steps[currentStep]?.canProceed || isPaused}
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
