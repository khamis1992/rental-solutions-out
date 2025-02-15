
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  loading?: boolean;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingOverlay({
  loading = true,
  text = "Loading...",
  fullScreen = false,
  className
}: LoadingOverlayProps) {
  if (!loading) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80",
        "backdrop-blur-sm z-50",
        fullScreen ? "fixed inset-0" : "absolute inset-0",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-300">
          {text}
        </p>
      )}
    </div>
  );
}
