
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { FilterConfig } from "../../types";
import { DatePicker } from "@/components/ui/date-picker";

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterConfig) => void;
}

export function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 100000]);
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");

  // Update filters when any of the filter values change
  useEffect(() => {
    const newFilters: FilterConfig = {};
    
    if (status.length > 0) {
      newFilters.status = status;
    }
    
    if (paymentStatus.length > 0) {
      newFilters.paymentStatus = paymentStatus;
    }
    
    if (startDate || endDate) {
      newFilters.dateRange = {
        start: startDate,
        end: endDate
      };
    }
    
    newFilters.amountRange = {
      min: amountRange[0],
      max: amountRange[1]
    };
    
    if (vehicleMake || vehicleModel || vehicleYear) {
      newFilters.vehicleDetails = {
        make: vehicleMake,
        model: vehicleModel,
        year: vehicleYear
      };
    }
    
    onFilterChange(newFilters);
  }, [
    status, 
    paymentStatus, 
    startDate, 
    endDate, 
    amountRange, 
    vehicleMake, 
    vehicleModel, 
    vehicleYear, 
    onFilterChange
  ]);

  const toggleStatus = (value: string) => {
    setStatus(prev => 
      prev.includes(value) 
        ? prev.filter(s => s !== value) 
        : [...prev, value]
    );
  };

  const togglePaymentStatus = (value: string) => {
    setPaymentStatus(prev => 
      prev.includes(value) 
        ? prev.filter(s => s !== value) 
        : [...prev, value]
    );
  };

  const resetFilters = () => {
    setStatus([]);
    setPaymentStatus([]);
    setStartDate(undefined);
    setEndDate(undefined);
    setAmountRange([0, 100000]);
    setVehicleMake("");
    setVehicleModel("");
    setVehicleYear("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'QAR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const anyFiltersApplied = 
    status.length > 0 || 
    paymentStatus.length > 0 || 
    startDate !== undefined || 
    endDate !== undefined || 
    amountRange[0] > 0 || 
    amountRange[1] < 100000 ||
    vehicleMake !== "" ||
    vehicleModel !== "" ||
    vehicleYear !== "";

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full border rounded-lg shadow-sm bg-card"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="text-lg font-medium">Advanced Filters</h3>
          {anyFiltersApplied && (
            <Badge variant="secondary" className="ml-2">
              Filters Applied
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {anyFiltersApplied && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          )}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      
      <CollapsibleContent>
        <div className="p-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status and Payment Status */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Agreement Status</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={status.includes("active") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStatus("active")}
                  >
                    Active
                  </Badge>
                  <Badge
                    variant={status.includes("pending_payment") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStatus("pending_payment")}
                  >
                    Pending Payment
                  </Badge>
                  <Badge
                    variant={status.includes("closed") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStatus("closed")}
                  >
                    Closed
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Payment Status</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={paymentStatus.includes("completed") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePaymentStatus("completed")}
                  >
                    Completed
                  </Badge>
                  <Badge
                    variant={paymentStatus.includes("pending") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePaymentStatus("pending")}
                  >
                    Pending
                  </Badge>
                  <Badge
                    variant={paymentStatus.includes("failed") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePaymentStatus("failed")}
                  >
                    Failed
                  </Badge>
                  <Badge
                    variant={paymentStatus.includes("partially_paid") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePaymentStatus("partially_paid")}
                  >
                    Partially Paid
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Date Range and Amount */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <DatePicker
                      date={startDate}
                      onSelect={setStartDate}
                      placeholder="Start date"
                    />
                  </div>
                  <div>
                    <DatePicker
                      date={endDate}
                      onSelect={setEndDate}
                      placeholder="End date"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Amount Range</Label>
                <div className="pt-4 px-2">
                  <Slider
                    defaultValue={[0, 100000]}
                    min={0}
                    max={100000}
                    step={1000}
                    value={amountRange}
                    onValueChange={(value) => setAmountRange(value as [number, number])}
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{formatCurrency(amountRange[0])}</span>
                    <span>{formatCurrency(amountRange[1])}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vehicle Details */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Vehicle Details</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Make (e.g. Toyota)"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                  />
                  <Input
                    placeholder="Model (e.g. Camry)"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                  />
                  <Select value={vehicleYear} onValueChange={setVehicleYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
