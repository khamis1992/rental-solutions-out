
import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { isValidDateFormat, parseDateFromDisplay, formatDateToDisplay } from "@/lib/dateUtils";

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onDateChange?: (date: Date | null) => void;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, error, value, onChange, onDateChange, ...props }, ref) => {
    const [inputValue, setInputValue] = useState(value as string || '');
    const [validationError, setValidationError] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
      value ? parseDateFromDisplay(value as string) || undefined : undefined
    );
    const [open, setOpen] = useState(false);

    useEffect(() => {
      // Update input value when value prop changes
      if (value && typeof value === 'string') {
        setInputValue(value);
        const parsedDate = parseDateFromDisplay(value);
        if (parsedDate) {
          setSelectedDate(parsedDate);
        }
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // Clear validation error while typing
      if (validationError) setValidationError('');

      // Call original onChange if provided
      if (onChange) onChange(e);

      // Validate complete date
      if (newValue.length === 10) {
        if (isValidDateFormat(newValue)) {
          const date = parseDateFromDisplay(newValue);
          if (date) {
            setSelectedDate(date);
            if (onDateChange) onDateChange(date);
          }
          setValidationError('');
        } else {
          setValidationError('Please enter a valid date in DD/MM/YYYY format');
          if (onDateChange) onDateChange(null);
        }
      }
    };

    const handleCalendarSelect = (date: Date | undefined) => {
      setOpen(false); // Close the popover after selection
      
      if (date) {
        const formattedDate = formatDateToDisplay(date);
        setInputValue(formattedDate);
        setSelectedDate(date);
        if (onDateChange) onDateChange(date);
        setValidationError('');

        // Trigger onChange event for form compatibility
        const event = {
          target: {
            value: formattedDate,
          }
        } as React.ChangeEvent<HTMLInputElement>;
        if (onChange) onChange(event);
      }
    };

    const handleBlur = () => {
      if (inputValue && !isValidDateFormat(inputValue)) {
        setValidationError('Please enter a valid date in DD/MM/YYYY format');
        if (onDateChange) onDateChange(null);
      }
    };

    return (
      <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              {...props}
              ref={ref}
              type="text"
              placeholder="DD/MM/YYYY"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={cn(
                "w-full pr-10",
                error || validationError ? "border-red-500" : "",
                className
              )}
            />
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  type="button"
                  onClick={() => setOpen(true)}
                >
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleCalendarSelect}
                  disabled={(date) => date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {(error || validationError) && (
          <p className="text-sm text-red-500">{error || validationError}</p>
        )}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";
