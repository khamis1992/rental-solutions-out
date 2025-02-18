
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  // Load existing progress
  useEffect(() => {
    const loadProgress = async () => {
      const { data, error } = await supabase
        .from('workflow_progress')
        .select('*')
        .eq('workflow_type', workflowType)
        .eq('is_complete', false)
        .single();

      if (data && !error) {
        setProgress({
          currentStep: data.current_step as WorkflowStep,
          completedSteps: data.completed_steps || [],
          formData: data.form_data || {}
        });
      }
    };

    loadProgress();
  }, [workflowType]);

  const saveProgress = async (newProgress: Partial<WorkflowProgress>) => {
    const updatedProgress = { ...progress, ...newProgress };
    
    const { error } = await supabase
      .from('workflow_progress')
      .upsert({
        workflow_type: workflowType,
        current_step: updatedProgress.currentStep,
        completed_steps: updatedProgress.completedSteps,
        form_data: updatedProgress.formData,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      setProgress(updatedProgress);
    }

    return !error;
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
