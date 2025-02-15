
import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

interface ContentCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function ContentCard({
  title,
  description,
  icon,
  children,
  className,
  footer,
  ...props
}: ContentCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200/50 dark:border-gray-700/50",
        "shadow-sm hover:shadow-md transition-shadow duration-300",
        className
      )}
      {...props}
    >
      {(title || description || icon) && (
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:scale-110">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
}
