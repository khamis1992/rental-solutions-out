
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface NavMenuItem {
  icon?: LucideIcon;
  label: string;
  href: string;
  description?: string;
}

interface NavMenuProps {
  items: NavMenuItem[];
  className?: string;
}

export function NavMenu({ items, className }: NavMenuProps) {
  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
            "hover:bg-gray-100 active:bg-gray-200 group",
            "dark:hover:bg-gray-800 dark:active:bg-gray-700"
          )}
        >
          {item.icon && (
            <item.icon className="h-5 w-5 text-gray-500 group-hover:text-gray-900 transition-colors" />
          )}
          <div>
            <span className="font-medium text-sm text-gray-700 group-hover:text-gray-900">
              {item.label}
            </span>
            {item.description && (
              <p className="text-xs text-gray-500">{item.description}</p>
            )}
          </div>
        </Link>
      ))}
    </nav>
  );
}
