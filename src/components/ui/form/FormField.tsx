
import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  helper?: string;
}

export function FormField({
  label,
  error,
  required,
  children,
  helper,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <Label className="flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {children}
      {helper && !error && (
        <p className="text-sm text-muted-foreground">{helper}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
