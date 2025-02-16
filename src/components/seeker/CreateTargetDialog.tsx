import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSeekerTargets } from "@/hooks/use-seeker-targets";

interface CreateTargetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTargetDialog({ open, onOpenChange }: CreateTargetDialogProps) {
  const [targetName, setTargetName] = useState('');
  const [targetType, setTargetType] = useState('');
  const { createTarget } = useSeekerTargets();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createTarget.mutateAsync({
      target_name: targetName,
      target_type: targetType,
      user_id: (await supabase.auth.getUser()).data.user?.id as string,
      status: 'active',
      last_seen_at: null,
      last_location_lat: null,
      last_location_lng: null,
      battery_level: null,
      network_type: null,
      device_info: {},
      metadata: {},
    });

    setTargetName('');
    setTargetType('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Target</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="targetName" className="text-sm font-medium">
              Target Name
            </label>
            <Input
              id="targetName"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="Enter target name"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="targetType" className="text-sm font-medium">
              Target Type
            </label>
            <Select value={targetType} onValueChange={setTargetType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Person</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="asset">Asset</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Target</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
