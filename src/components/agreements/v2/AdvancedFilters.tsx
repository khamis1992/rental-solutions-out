
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterConfig } from "./types";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Slider 
} from "@/components/ui/slider";
import { 
  Filter,
  CalendarIcon,
  X,
  ChevronsUpDown,
  CheckSquare,
  Square
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterConfig) => void;
  initialFilters?: FilterConfig;
  className?: string;
}

export const AdvancedFilters = ({ 
  onFilterChange, 
  initialFilters,
  className = ""
}: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<FilterConfig>(initialFilters || {
    status: [],
    paymentStatus: [],
    dateRange: { start: undefined, end: undefined },
    amountRange: { min: 0, max: 5000 },
    vehicleDetails: { make: "", model: "", year: "" }
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "pending_payment", label: "Pending Payment" },
    { value: "closed", label: "Closed" }
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "partially_paid", label: "Partially Paid" }
  ];

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.status && filters.status.length) count++;
    if (filters.paymentStatus && filters.paymentStatus.length) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.vehicleDetails?.make || filters.vehicleDetails?.model || filters.vehicleDetails?.year) count++;
    setActiveFiltersCount(count);
    
    // Notify parent component
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleStatusChange = (status: string) => {
    setFilters(prev => {
      const currentStatuses = prev.status || [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status];
      
      return { ...prev, status: newStatuses };
    });
  };

  const handlePaymentStatusChange = (status: string) => {
    setFilters(prev => {
      const currentStatuses = prev.paymentStatus || [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status];
      
      return { ...prev, paymentStatus: newStatuses };
    });
  };

  const handleDateChange = (field: "start" | "end", date?: Date) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: date
      }
    }));
  };

  const handleAmountRangeChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      amountRange: {
        min: values[0],
        max: values[1]
      }
    }));
  };

  const handleVehicleDetailChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      vehicleDetails: {
        ...prev.vehicleDetails,
        [field]: value
      }
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: [],
      paymentStatus: [],
      dateRange: { start: undefined, end: undefined },
      amountRange: { min: 0, max: 5000 },
      vehicleDetails: { make: "", model: "", year: "" }
    });
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3 gap-1"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs font-normal rounded-full px-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="text-xs h-8 px-2"
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Agreement Status</h5>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={filters.status?.includes(option.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange(option.value)}
                      className="text-xs h-7"
                    >
                      {filters.status?.includes(option.value) ? (
                        <CheckSquare className="mr-1 h-3 w-3" />
                      ) : (
                        <Square className="mr-1 h-3 w-3" />
                      )}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Payment Status Filter */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Payment Status</h5>
                <div className="flex flex-wrap gap-2">
                  {paymentStatusOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={filters.paymentStatus?.includes(option.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePaymentStatusChange(option.value)}
                      className="text-xs h-7"
                    >
                      {filters.paymentStatus?.includes(option.value) ? (
                        <CheckSquare className="mr-1 h-3 w-3" />
                      ) : (
                        <Square className="mr-1 h-3 w-3" />
                      )}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Date Range</h5>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.dateRange?.start && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange?.start ? (
                            format(filters.dateRange.start, "PPP")
                          ) : (
                            <span>From</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange?.start}
                          onSelect={(date) => handleDateChange("start", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.dateRange?.end && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange?.end ? (
                            format(filters.dateRange.end, "PPP")
                          ) : (
                            <span>To</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange?.end}
                          onSelect={(date) => handleDateChange("end", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Amount Range Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">Amount Range</h5>
                  <span className="text-xs text-muted-foreground">
                    {filters.amountRange?.min} - {filters.amountRange?.max} QAR
                  </span>
                </div>
                <Slider
                  defaultValue={[filters.amountRange?.min || 0, filters.amountRange?.max || 5000]}
                  max={10000}
                  step={100}
                  onValueChange={handleAmountRangeChange}
                  className="py-2"
                />
              </div>

              {/* Vehicle Details Filter */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Vehicle Details</h5>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="make" className="text-xs">Make</Label>
                    <Input
                      id="make"
                      placeholder="Vehicle make"
                      value={filters.vehicleDetails?.make || ""}
                      onChange={(e) => handleVehicleDetailChange("make", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="model" className="text-xs">Model</Label>
                    <Input
                      id="model"
                      placeholder="Vehicle model"
                      value={filters.vehicleDetails?.model || ""}
                      onChange={(e) => handleVehicleDetailChange("model", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="year" className="text-xs">Year</Label>
                  <Input
                    id="year"
                    placeholder="Vehicle year"
                    value={filters.vehicleDetails?.year || ""}
                    onChange={(e) => handleVehicleDetailChange("year", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="border-t p-4">
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.status && filters.status.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span>Status: {filters.status.join(", ")}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, status: [] }))} 
                />
              </Badge>
            )}
            
            {filters.paymentStatus && filters.paymentStatus.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span>Payment: {filters.paymentStatus.join(", ")}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, paymentStatus: [] }))} 
                />
              </Badge>
            )}
            
            {(filters.dateRange?.start || filters.dateRange?.end) && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span>Date: {filters.dateRange?.start ? format(filters.dateRange.start, "MMM d") : "Any"} - {filters.dateRange?.end ? format(filters.dateRange.end, "MMM d") : "Any"}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, dateRange: { start: undefined, end: undefined } }))} 
                />
              </Badge>
            )}

            {(filters.vehicleDetails?.make || filters.vehicleDetails?.model || filters.vehicleDetails?.year) && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span>
                  Vehicle: 
                  {filters.vehicleDetails?.make ? ` ${filters.vehicleDetails.make}` : ""}
                  {filters.vehicleDetails?.model ? ` ${filters.vehicleDetails.model}` : ""}
                  {filters.vehicleDetails?.year ? ` ${filters.vehicleDetails.year}` : ""}
                </span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, vehicleDetails: { make: "", model: "", year: "" } }))} 
                />
              </Badge>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="h-7 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
