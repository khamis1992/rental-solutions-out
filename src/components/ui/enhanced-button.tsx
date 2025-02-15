
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/button";

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
}

export const EnhancedButton = ({
  children,
  loading,
  success,
  error,
  loadingText = "Loading...",
  successText = "Success!",
  errorText = "Error",
  className,
  ...props
}: EnhancedButtonProps) => {
  return (
    <Button
      className={cn(
        "relative",
        success && "bg-green-500 hover:bg-green-600",
        error && "bg-red-500 hover:bg-red-600",
        className
      )}
      disabled={loading || success || error}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-2">{loadingText}</span>
        </div>
      )}
      {success && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <CheckCircle className="h-5 w-5" />
          <span className="ml-2">{successText}</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <XCircle className="h-5 w-5" />
          <span className="ml-2">{errorText}</span>
        </div>
      )}
      <span className={loading || success || error ? "invisible" : ""}>
        {children}
      </span>
    </Button>
  );
};
