
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { debounce } from 'lodash';

export type WorkflowStep = 'customer-info' | 'vehicle-details' | 'agreement-terms' | 'review';

interface WorkflowProgress {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  formData: any;
  is_complete?: boolean;
}

export const useWorkflowProgress = (workflowType: string) => {
  const [progress, setProgress] = useState<WorkflowProgress>({
    currentStep: 'customer-info',
    completedSteps: [],
    formData: {},
    is_complete: false
  });
  
  const { session } = useAuth();
  const isInitialLoadDone = useRef(false);
  const isSaving = useRef(false);

  // Load existing progress only once on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        if (!session?.user?.id || isInitialLoadDone.current) return;

        console.log("Loading initial workflow progress...");
        const { data: existingProgress, error } = await supabase
          .from('workflow_progress')
          .select('*')
          .eq('workflow_type', workflowType)
          .eq('is_complete', false)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading workflow progress:', error);
          return;
        }

        if (existingProgress) {
          console.log("Found existing progress:", existingProgress);
          setProgress({
            currentStep: existingProgress.current_step as WorkflowStep,
            completedSteps: (existingProgress.completed_steps as string[] || []) as WorkflowStep[],
            formData: existingProgress.form_data || {},
            is_complete: existingProgress.is_complete
          });
        } else {
          console.log("Creating new workflow progress");
          const { error: insertError } = await supabase
            .from('workflow_progress')
            .insert({
              workflow_type: workflowType,
              current_step: 'customer-info',
              completed_steps: [],
              form_data: {},
              is_complete: false,
              user_id: session.user.id
            });

          if (insertError) {
            console.error('Error creating workflow progress:', insertError);
          }
        }
        
        isInitialLoadDone.current = true;
      } catch (err) {
        console.error('Error in loadProgress:', err);
      }
    };

    if (session?.user?.id) {
      loadProgress();
    }
  }, [workflowType, session?.user?.id]);

  const saveProgress = async (newProgress: Partial<WorkflowProgress>) => {
    try {
      if (!session?.user?.id || isSaving.current) return false;
      
      isSaving.current = true;
      console.log("Saving workflow progress:", newProgress);
      
      const updatedProgress = { ...progress, ...newProgress };
      
      const { error } = await supabase
        .from('workflow_progress')
        .upsert({
          workflow_type: workflowType,
          current_step: updatedProgress.currentStep,
          completed_steps: updatedProgress.completedSteps,
          form_data: updatedProgress.formData,
          is_complete: updatedProgress.is_complete ?? false,
          updated_at: new Date().toISOString(),
          user_id: session.user.id
        });

      if (error) {
        console.error('Error saving progress:', error);
        return false;
      }

      setProgress(updatedProgress);
      console.log("Successfully saved workflow progress");
      return true;
    } catch (err) {
      console.error('Error in saveProgress:', err);
      return false;
    } finally {
      isSaving.current = false;
    }
  };

  // Create a debounced version of saveFormData with increased delay
  const debouncedSaveFormData = debounce(async (formData: any) => {
    if (isInitialLoadDone.current) {
      console.log("Debounced save of form data:", formData);
      await saveProgress({ formData });
    }
  }, 2000); // Increased debounce delay to 2 seconds

  const completeStep = async (step: WorkflowStep) => {
    const completedSteps = [...progress.completedSteps];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }
    return saveProgress({ completedSteps });
  };

  const goToStep = async (step: WorkflowStep) => {
    return saveProgress({ currentStep: step });
  };

  return {
    progress,
    saveProgress,
    completeStep,
    goToStep,
    debouncedSaveFormData,
    isInitialized: isInitialLoadDone.current
  };
};
