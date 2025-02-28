
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  onPrint: () => void;
  className?: string;
}

export const PrintButton = ({ onPrint, className }: PrintButtonProps) => {
  return (
    <Button 
      onClick={onPrint}
      variant="success"
      className={`print:hidden ${className || ""}`}
    >
      <Printer className="h-4 w-4 mr-2" />
      طباعة
    </Button>
  );
};
