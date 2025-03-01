
/**
 * JobCardForm Component
 * 
 * This component provides a form for creating and editing maintenance job cards.
 * It captures details about vehicle maintenance tasks including service type,
 * description, scheduled date, and cost estimates.
 * 
 * Part of the maintenance module, it enables users to log maintenance work
 * that needs to be performed on vehicles.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Props interface for the JobCardForm component
 * 
 * @property formData - Current form field values
 * @property vehicles - Array of vehicle options to select from
 * @property categories - Array of maintenance category options
 * @property onFormDataChange - Callback for form data changes
 * @property onSubmit - Form submission handler
 * @property loading - Boolean indicating if form submission is in progress
 */
interface JobCardFormProps {
  formData: {
    vehicle_id: string;
    category_id: string;
    service_type: string;
    description: string;
    scheduled_date: string;
    cost: string;
  };
  vehicles: any[];
  categories: any[];
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

/**
 * Form component for creating and editing maintenance job cards
 */
export function JobCardForm({
  formData,
  vehicles,
  categories,
  onFormDataChange,
  onSubmit,
  loading
}: JobCardFormProps) {
  /**
   * Handles changes to form field values
   * 
   * @param field - The name of the field being changed
   * @param value - The new value for the field
   */
  const handleChange = (field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  // ----- Section: Job Card Form -----
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Vehicle Selection */}
      <div className="space-y-2">
        <Label htmlFor="vehicle_id">Vehicle</Label>
        <Select
          value={formData.vehicle_id}
          onValueChange={(value) => handleChange("vehicle_id", value)}
          required
        >
          <SelectTrigger id="vehicle_id" aria-label="Select a vehicle">
            <SelectValue placeholder="Select a vehicle" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model} ({vehicle.license_plate})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Maintenance Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="category_id">Maintenance Category</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => handleChange("category_id", value)}
          required
        >
          <SelectTrigger id="category_id" aria-label="Select a category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Service Type Input */}
      <div className="space-y-2">
        <Label htmlFor="service_type">Service Type</Label>
        <Input
          id="service_type"
          value={formData.service_type}
          onChange={(e) => handleChange("service_type", e.target.value)}
          required
          placeholder="Enter service type"
        />
      </div>

      {/* Description Textarea */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the maintenance needed"
        />
      </div>

      {/* Scheduled Date Input */}
      <div className="space-y-2">
        <Label htmlFor="scheduled_date">Scheduled Date</Label>
        <Input
          id="scheduled_date"
          type="datetime-local"
          value={formData.scheduled_date}
          onChange={(e) => handleChange("scheduled_date", e.target.value)}
          required
        />
      </div>

      {/* Estimated Cost Input */}
      <div className="space-y-2">
        <Label htmlFor="cost">Estimated Cost</Label>
        <Input
          id="cost"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.cost}
          onChange={(e) => handleChange("cost", e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create and Proceed to Inspection"}
      </Button>
    </form>
  );
}
