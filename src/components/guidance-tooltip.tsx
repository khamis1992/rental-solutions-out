
import React from "react";
import { Info, HelpCircle, Lightbulb } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type GuidanceTooltipProps = {
  content: React.ReactNode;
  icon?: "info" | "help" | "lightbulb";
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  iconClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  /** Whether to show a darker themed tooltip */
  variant?: "default" | "info";
};

export function GuidanceTooltip({
  content,
  icon = "info",
  position = "top",
  className = "",
  iconClassName = "",
  contentClassName = "",
  children,
  variant = "default",
}: GuidanceTooltipProps) {
  const IconComponent = {
    info: Info,
    help: HelpCircle,
    lightbulb: Lightbulb,
  }[icon];

  const baseIconClass = "h-4 w-4 cursor-help transition-colors";
  const variantIconClass = variant === "default" 
    ? "text-muted-foreground hover:text-foreground" 
    : "text-blue-500 hover:text-blue-600";

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 ${className}`}>
            {children}
            <IconComponent
              className={`${baseIconClass} ${variantIconClass} ${iconClassName}`}
              aria-hidden="true"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={position}
          className={`max-w-[280px] text-sm ${
            variant === "info" ? "bg-blue-50 border-blue-100" : ""
          } ${contentClassName}`}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
