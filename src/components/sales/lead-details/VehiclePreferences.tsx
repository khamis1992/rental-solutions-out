
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VehicleLeadPreferences } from "@/types/vehicle-matching";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface VehiclePreferencesProps {
  leadId: string;
}

export function VehiclePreferences({ leadId }: VehiclePreferencesProps) {
  const [newColor, setNewColor] = useState("");
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["vehicle-preferences", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_lead_preferences")
        .select("*")
        .eq("lead_id", leadId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as VehicleLeadPreferences;
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<VehicleLeadPreferences>) => {
      if (preferences?.id) {
        const { error } = await supabase
          .from("vehicle_lead_preferences")
          .update(data)
          .eq("id", preferences.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("vehicle_lead_preferences")
          .insert([{ ...data, lead_id: leadId }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-preferences", leadId] });
      toast.success("Preferences updated successfully");
    },
    onError: (error) => {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    },
  });

  const addColor = () => {
    if (!newColor) return;
    
    const currentColors = preferences?.preferred_colors || [];
    if (currentColors.includes(newColor)) {
      toast.error("This color is already added");
      return;
    }

    updatePreferencesMutation.mutate({
      preferred_colors: [...currentColors, newColor],
    });
    setNewColor("");
  };

  const removeColor = (color: string) => {
    const currentColors = preferences?.preferred_colors || [];
    updatePreferencesMutation.mutate({
      preferred_colors: currentColors.filter((c) => c !== color),
    });
  };

  const updateYearRange = (type: "min" | "max", value: string) => {
    const yearValue = value ? parseInt(value) : null;
    updatePreferencesMutation.mutate({
      [type === "min" ? "min_year" : "max_year"]: yearValue,
    });
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Preferences</CardTitle>
        <CardDescription>
          Specify preferences to help find the perfect vehicle match
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">Preferred Colors</h4>
          <div className="flex flex-wrap gap-2">
            {preferences?.preferred_colors?.map((color) => (
              <Badge
                key={color}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {color}
                <button
                  onClick={() => removeColor(color)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addColor()}
            />
            <Button onClick={addColor}>Add</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Year</label>
            <Input
              type="number"
              placeholder="Min year"
              value={preferences?.min_year || ""}
              onChange={(e) => updateYearRange("min", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Year</label>
            <Input
              type="number"
              placeholder="Max year"
              value={preferences?.max_year || ""}
              onChange={(e) => updateYearRange("max", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
