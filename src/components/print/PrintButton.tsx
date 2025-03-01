
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { NewPrintSettingsDialog } from "./NewPrintSettingsDialog";
import { triggerPrint, prepareForPrint } from "@/lib/printStyles";

interface PrintButtonProps {
  contentId?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success";
  showIcon?: boolean;
  buttonText?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  directPrint?: boolean; // New prop to skip the dialog
}

export function PrintButton({
  contentId = "printable-content",
  className = "",
  variant = "outline",
  showIcon = true,
  buttonText = "Print",
  onBeforePrint,
  onAfterPrint,
  directPrint = false // Default to false to maintain backward compatibility
}: PrintButtonProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handlePrint = () => {
    if (onBeforePrint) {
      onBeforePrint();
    }
    
    if (prepareForPrint(contentId)) {
      triggerPrint(onAfterPrint);
    }
  };

  const handleClick = () => {
    if (directPrint) {
      handlePrint();
    } else {
      setShowSettings(true);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        className={`print:hidden ${className}`}
        onClick={handleClick}
      >
        {showIcon && <Printer className="h-4 w-4 mr-2" />}
        {buttonText}
      </Button>
      
      {!directPrint && (
        <NewPrintSettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          onPrint={handlePrint}
        />
      )}
    </>
  );
}
