
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export type WorkflowStep = 'customer-info' | 'vehicle-details' | 'agreement-terms' | 'review';

interface WorkflowProgress {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  formData: any;
}

export const useWorkflowProgress = (workflowType: string) => {
  const [progress, setProgress] = useState<WorkflowProgress>({
    currentStep: 'customer-info',
    completedSteps: [],
    formData: {}
  });
  
  const { session } = useAuth();

  // Load existing progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Try to get existing progress
        const { data: existingProgress, error } = await supabase
          .from('workflow_progress')
          .select('*')
          .eq('workflow_type', workflowType)
          .eq('is_complete', false)
          .maybeSingle();

        if (error) {
          console.error('Error loading workflow progress:', error);
          return;
        }

        if (existingProgress) {
          setProgress({
            currentStep: existingProgress.current_step as WorkflowStep,
            completedSteps: (existingProgress.completed_steps as string[] || []) as WorkflowStep[],
            formData: existingProgress.form_data || {}
          });
        } else {
          // Create new workflow progress if none exists
          const { error: insertError } = await supabase
            .from('workflow_progress')
            .insert({
              workflow_type: workflowType,
              current_step: 'customer-info',
              completed_steps: [],
              form_data: {},
              is_complete: false,
              user_id: session?.user?.id
            });

          if (insertError) {
            console.error('Error creating workflow progress:', insertError);
          }
        }
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
      const updatedProgress = { ...progress, ...newProgress };
      
      const { error } = await supabase
        .from('workflow_progress')
        .upsert({
          workflow_type: workflowType,
          current_step: updatedProgress.currentStep,
          completed_steps: updatedProgress.completedSteps,
          form_data: updatedProgress.formData,
          is_complete: false,
          updated_at: new Date().toISOString(),
          user_id: session?.user?.id
        });

      if (error) {
        console.error('Error saving progress:', error);
        return false;
      }

      setProgress(updatedProgress);
      return true;
    } catch (err) {
      console.error('Error in saveProgress:', err);
      return false;
    }
  };

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
    goToStep
  };
};
