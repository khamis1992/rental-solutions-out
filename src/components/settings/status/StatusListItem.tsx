
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Check, Pencil, X } from "lucide-react";
import { useInputHandler, useFormSubmitHandler, useToggleHandler } from "@/hooks/useEventHandlers";

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
  
  // Use our standardized input handler for the name edit field
  const nameInputHandler = useInputHandler(status.name, {
    validator: (value) => value.trim().length > 0, // Simple validation
    transform: (value) => value.trim() // Trim whitespace
  });
  
  // Use our standardized form submit handler for updates
  const updateHandler = useFormSubmitHandler(
    async () => {
      if (nameInputHandler.isValid && nameInputHandler.value) {
        await onUpdate(status.id, nameInputHandler.value);
        setEditingId(null);
      }
    },
    () => {
      // Success callback - nothing needed as the UI will update
    },
    (error) => {
      console.error("Error updating status:", error);
      // We could show an error message here
    }
  );
  
  // Use our standardized toggle handler for the active state
  const activeToggleHandler = useFormSubmitHandler(
    async () => {
      await onToggle(status.id, status.is_active);
    }
  );
  
  // Start editing handler
  const handleStartEditing = () => {
    setEditingId(status.id);
    nameInputHandler.setValue(status.name);
  };
  
  // Cancel editing handler
  const handleCancelEditing = () => {
    setEditingId(null);
    nameInputHandler.reset();
  };

  return (
    <TableRow key={status.id}>
      <TableCell>
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={nameInputHandler.value}
              onChange={nameInputHandler.handleChange}
              className={`w-[200px] ${!nameInputHandler.isValid ? 'border-red-500' : ''}`}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => updateHandler.handleSubmit(null)}
              disabled={updateHandler.isSubmitting || !nameInputHandler.isValid}
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
