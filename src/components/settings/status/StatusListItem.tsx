
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Check, Pencil, X } from "lucide-react";
import { useInputHandler, useFormSubmitHandler, useToggleHandler } from "@/hooks/useEventHandlers";
import { z } from "zod";
import { useFormValidation } from "@/hooks/useFormValidation";

interface StatusListItemProps {
  status: {
    id: string;
    name: string;
    is_active: boolean;
  };
  onUpdate: (id: string, name: string) => Promise<void>;
  onToggle: (id: string, currentActive: boolean) => Promise<void>;
}

export const StatusListItem = ({ status, onUpdate, onToggle }: StatusListItemProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const isEditing = editingId === status.id;
  
  // Define a schema for the status name field
  const schema = z.object({
    name: z.string().min(1, "Status name is required").max(50, "Name is too long"),
  });
  
  // Use our enhanced form validation
  const form = useFormValidation(
    { name: status.name },
    {
      schema,
      validateOnChange: true,
    }
  );
  
  // Use our standardized form submit handler for updates
  const updateHandler = useFormSubmitHandler(
    async () => {
      if (form.isValid && form.values.name) {
        await onUpdate(status.id, form.values.name);
        setEditingId(null);
      }
    },
    {
      successMessage: "Status updated successfully",
      errorMessage: "Failed to update status"
    }
  );
  
  // Use our standardized toggle handler for the active state
  const activeToggleHandler = useFormSubmitHandler(
    async () => {
      await onToggle(status.id, status.is_active);
    },
    {
      successMessage: `Status ${status.is_active ? 'deactivated' : 'activated'} successfully`,
      errorMessage: "Failed to update status"
    }
  );
  
  // Start editing handler
  const handleStartEditing = () => {
    setEditingId(status.id);
    form.setFieldValue('name', status.name);
  };
  
  // Cancel editing handler
  const handleCancelEditing = () => {
    setEditingId(null);
    form.resetForm();
  };

  return (
    <TableRow key={status.id}>
      <TableCell>
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              name="name"
              value={form.values.name}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className={`w-[200px] ${form.errors.name ? 'border-red-500' : ''}`}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => updateHandler.handleSubmit(null)}
              disabled={updateHandler.isSubmitting || !form.isValid}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancelEditing}
              disabled={updateHandler.isSubmitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          status.name
        )}
        {form.errors.name && isEditing && (
          <p className="text-xs text-red-500 mt-1">{form.errors.name[0]}</p>
        )}
      </TableCell>
      <TableCell>
        <Button
          variant={status.is_active ? "default" : "secondary"}
          onClick={() => activeToggleHandler.handleSubmit(null)}
          disabled={activeToggleHandler.isSubmitting}
        >
          {status.is_active ? "Active" : "Inactive"}
        </Button>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStartEditing}
          disabled={isEditing}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
