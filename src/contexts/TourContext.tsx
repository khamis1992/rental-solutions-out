
/**
 * TourContext
 * 
 * This context provides a guided tour functionality throughout the application.
 * It manages the state and navigation of multi-step tours to help users
 * learn about features and functionality.
 * 
 * The context includes functions to start, navigate through, and end tours,
 * as well as tracking which tours users have already seen.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Defines a step in the guided tour
 */
interface TourStep {
  target: string;           // CSS selector for the element to highlight
  content: string;          // Content/description to show for this step
  title: string;            // Title of the tour step
  position?: 'top' | 'bottom' | 'left' | 'right';  // Position of the tooltip
}

/**
 * Tour context interface defining the shape of the context
 */
interface TourContextType {
  currentStep: number;                  // Current step index
  setCurrentStep: (step: number) => void; // Function to set current step
  isActive: boolean;                    // Whether a tour is currently active
  startTour: () => void;                // Start the tour
  endTour: () => void;                  // End the tour
  nextStep: () => void;                 // Go to next step
  previousStep: () => void;             // Go to previous step
}

// Create the context with undefined initial value
const TourContext = createContext<TourContextType | undefined>(undefined);

/**
 * Props for the TourProvider component
 */
interface TourProviderProps {
  children: ReactNode;    // Child components
  steps: TourStep[];      // Tour steps configuration
}

/**
 * Provider component that wraps the application to provide tour functionality
 * 
 * @param children - Child components
 * @param steps - Array of tour steps to display
 */
export function TourProvider({ children, steps }: TourProviderProps) {
  // ----- Section: State Management -----
  const [currentStep, setCurrentStep] = useState(-1); // -1 means tour is not active
  const [isActive, setIsActive] = useState(false);    // Track if tour is active

  // ----- Section: Initialization -----
  // Check if user has seen the tour before on component mount
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      startTour();
    }
  }, []);

  /**
   * Start the guided tour from the beginning
   */
  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
    toast.info("Welcome! Let's take a quick tour.", {
      duration: 5000,
    });
  };

  /**
   * End the tour and mark it as seen in localStorage
   */
  const endTour = () => {
    setCurrentStep(-1);
    setIsActive(false);
    localStorage.setItem('hasSeenTour', 'true');
    toast.success("Tour completed! You can restart it anytime from the help menu.");
  };

  /**
   * Navigate to the next step or end the tour if on the last step
   */
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      endTour();
    }
  };

  /**
   * Navigate to the previous step if not on the first step
   */
  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
    }
  };

  // Context value to provide to consumers
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
      {/* ----- Section: Tour UI Overlay ----- */}
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

/**
 * Custom hook to access the tour context
 * @returns The tour context value
 * @throws Error if used outside of a TourProvider
 */
export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
