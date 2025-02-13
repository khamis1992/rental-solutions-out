
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { VehicleFilterParams, VehicleStatus } from "@/types/vehicle";
import { Badge } from "@/components/ui/badge";

interface VehicleFilterDialogProps {
  onFilterChange: (filters: VehicleFilterParams) => void;
  activeFilters: VehicleFilterParams;
  totalFilters: number;
}

export const VehicleFilterDialog = ({
  onFilterChange,
  activeFilters,
  totalFilters,
}: VehicleFilterDialogProps) => {
  const handleStatusChange = (value: VehicleStatus) => {
    onFilterChange({ ...activeFilters, status: value });
  };

  const handleMakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...activeFilters, make: e.target.value });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...activeFilters, model: e.target.value });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value ? parseInt(e.target.value) : undefined;
    onFilterChange({ ...activeFilters, year });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 md:flex-none items-center gap-2 hover:bg-secondary/10 transition-colors relative"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {totalFilters > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalFilters}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Filter Vehicles</DialogTitle>
            {totalFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear filters
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={activeFilters.status}
              onValueChange={(value) => handleStatusChange(value as VehicleStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="make">Make</Label>
            <Input
              id="make"
              value={activeFilters.make || ""}
              onChange={handleMakeChange}
              placeholder="Filter by make..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={activeFilters.model || ""}
              onChange={handleModelChange}
              placeholder="Filter by model..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={activeFilters.year || ""}
              onChange={handleYearChange}
              placeholder="Filter by year..."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
