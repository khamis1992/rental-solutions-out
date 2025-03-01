
/**
 * WorkflowForm Component
 * 
 * This component provides a form for creating and editing workflows in the legal module.
 * It allows users to input workflow details and manage workflow templates.
 * 
 * The component is part of the workflow management system within the legal module,
 * enabling users to standardize and automate legal processes.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowTemplate } from "../types/workflow.types";

/**
 * Props interface for the WorkflowForm component
 * 
 * @property selectedTemplate - The currently selected workflow template, if any
 * @property onTemplateSelect - Function to handle template selection changes
 */
interface WorkflowFormProps {
  selectedTemplate: WorkflowTemplate | null;
  onTemplateSelect: (template: WorkflowTemplate | null) => void;
}

/**
 * Form component for creating and editing workflow templates
 * 
 * @param selectedTemplate - Currently selected template (null if creating new)
 * @param onTemplateSelect - Callback for when template selection changes
 */
export function WorkflowForm({ selectedTemplate, onTemplateSelect }: WorkflowFormProps) {
  return (
    <div className="space-y-4">
      {/* ----- Section: Form Header ----- */}
      <h3 className="text-lg font-medium">Create New Workflow</h3>
      
      {/* ----- Section: Form Fields ----- */}
      <div className="space-y-4">
        {/* Workflow Name Field */}
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input 
            placeholder="Enter workflow name"
            value={selectedTemplate?.name || ''}
          />
        </div>
        
        {/* Workflow Description Field */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea 
            placeholder="Enter workflow description"
            value={selectedTemplate?.description || ''}
          />
        </div>
        
        {/* ----- Section: Form Actions ----- */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onTemplateSelect(null)}
          >
            Cancel
          </Button>
          <Button>
            Save Workflow
          </Button>
        </div>
      </div>
    </div>
  );
}
