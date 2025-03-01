
/**
 * TemplateList Component
 * 
 * This component displays a list of agreement templates in a tabular format.
 * It provides information about each template and actions for previewing, editing, and deleting.
 * 
 * The component is used in the templates management section to help users
 * view and manage their agreement templates.
 */

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Template interface defining the shape of template data
 */
interface Template {
  id: string;
  name: string;
  description: string;
  agreement_type: "lease_to_own" | "short_term";
  rent_amount: number;
  final_price: number;
  agreement_duration: string;
  daily_late_fee: number;
  is_active: boolean;
  template_structure: Record<string, any>;
  template_sections: any[];
  variable_mappings: Record<string, any>;
}

/**
 * Props interface for the TemplateList component
 * 
 * @property templates - Array of template objects to display
 * @property isLoading - Boolean indicating if templates are being loaded
 * @property onPreview - Optional callback when preview button is clicked
 * @property onEdit - Optional callback when edit button is clicked
 * @property onDelete - Optional callback when delete button is clicked
 */
interface TemplateListProps {
  templates: Template[];
  isLoading: boolean;
  onPreview?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
}

/**
 * Component that displays a table of agreement templates with actions
 */
export const TemplateList = ({ 
  templates, 
  isLoading,
  onPreview,
  onEdit,
  onDelete 
}: TemplateListProps) => {
  // ----- Section: Loading State -----
  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  /**
   * Helper function to count variables in a template
   * 
   * @param template - The template to analyze
   * @returns The total number of variables in the template
   */
  const getVariableCount = (template: Template) => {
    const mappings = template.variable_mappings || {};
    return Object.values(mappings).reduce((count, section) => 
      count + Object.keys(section as object).length, 0
    );
  };

  // ----- Section: Templates Table -----
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Variables</TableHead>
          <TableHead>Sections</TableHead>
          <TableHead>Base Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.id}>
            {/* Template name and description */}
            <TableCell className="font-medium">
              {template.name}
              {template.description && (
                <p className="text-sm text-muted-foreground">{template.description}</p>
              )}
            </TableCell>
            
            {/* Agreement type badge */}
            <TableCell>
              <Badge variant={template.agreement_type === "lease_to_own" ? "default" : "secondary"}>
                {template.agreement_type === "lease_to_own" ? "Lease to Own" : "Short Term"}
              </Badge>
            </TableCell>
            
            {/* Template metadata */}
            <TableCell>{getVariableCount(template)} variables</TableCell>
            <TableCell>{(template.template_sections || []).length} sections</TableCell>
            <TableCell>{template.rent_amount} QAR</TableCell>
            
            {/* Template status badge */}
            <TableCell>
              <Badge variant={template.is_active ? "success" : "secondary"}>
                {template.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            
            {/* Action buttons */}
            <TableCell>
              <div className="flex items-center gap-2">
                {/* Preview button */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onPreview?.(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {/* Edit button */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit?.(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                {/* Delete button */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDelete?.(template)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        
        {/* Empty state when no templates exist */}
        {templates.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              No templates found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
