
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

interface TourStep {
  target: string;
  content: string;
  title: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isActive: boolean;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  previousStep: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: React.ReactNode;
  steps: TourStep[];
}

export function TourProvider({ children, steps }: TourProviderProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      startTour();
    }
  }, []);

  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
    toast.info("Welcome! Let's take a quick tour.", {
      duration: 5000,
    });
  };

  const endTour = () => {
    setCurrentStep(-1);
    setIsActive(false);
    localStorage.setItem('hasSeenTour', 'true');
    toast.success("Tour completed! You can restart it anytime from the help menu.");
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      endTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
    }
  };

  const value = {
    currentStep,
    setCurrentStep,
    isActive,
    startTour,
    endTour,
    nextStep,
    previousStep,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      {isActive && currentStep >= 0 && currentStep < steps.length && (
        <div className="fixed bottom-4 right-4 bg-card p-4 rounded-lg shadow-lg border z-50 max-w-sm animate-in slide-in-from-right-5">
          <h3 className="font-semibold mb-2">{steps[currentStep].title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{steps[currentStep].content}</p>
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={previousStep} disabled={currentStep === 0}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={endTour}>
              Skip Tour
            </Button>
            <Button size="sm" onClick={nextStep}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      )}
    </TourContext.Provider>
  );
}

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
