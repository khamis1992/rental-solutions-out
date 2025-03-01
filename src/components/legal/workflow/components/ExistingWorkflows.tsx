
/**
 * ExistingWorkflows Component
 * 
 * This component displays a list of existing workflow templates in the legal module.
 * It shows details about each workflow and allows users to select templates for viewing or editing.
 * 
 * The component is part of the workflow management system within the legal module,
 * helping users manage and reuse standardized legal processes.
 */

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowTemplate } from "../types/workflow.types";

/**
 * Props interface for the ExistingWorkflows component
 * 
 * @property templates - Array of workflow templates to display
 * @property isLoading - Boolean indicating if templates are being loaded
 * @property onTemplateSelect - Callback function when a template is selected
 * @property selectedTemplateId - ID of the currently selected template (if any)
 */
interface ExistingWorkflowsProps {
  templates: WorkflowTemplate[];
  isLoading: boolean;
  onTemplateSelect: (template: WorkflowTemplate) => void;
  selectedTemplateId?: string;
}

/**
 * Component for displaying existing workflow templates
 * 
 * @param templates - Array of workflow templates to display
 * @param isLoading - Loading state for skeleton display
 * @param onTemplateSelect - Function called when a template is selected
 * @param selectedTemplateId - ID of the currently selected template (optional)
 */
export function ExistingWorkflows({ 
  templates, 
  isLoading, 
  onTemplateSelect,
  selectedTemplateId 
}: ExistingWorkflowsProps) {
  // ----- Section: Loading State -----
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Existing Workflows</h3>
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // ----- Section: Workflow List Display -----
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Existing Workflows</h3>
      {templates.length === 0 ? (
        // Empty state when no workflows exist
        <Card className="p-6 text-center text-muted-foreground">
          No workflows created yet
        </Card>
      ) : (
        // List of workflow templates
        <div className="space-y-2">
          {templates.map((template) => (
            <Card 
              key={template.id}
              // Highlight selected template with border color
              className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedTemplateId === template.id ? 'border-primary' : ''
              }`}
              onClick={() => onTemplateSelect(template)}
            >
              <h4 className="font-medium">{template.name}</h4>
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                Steps: {template.steps.length} | Last updated: {new Date(template.updated_at).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
