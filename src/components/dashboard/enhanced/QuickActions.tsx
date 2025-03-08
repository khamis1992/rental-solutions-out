
import { Button } from "@/components/ui/button";
import { 
  Car, 
  CalendarPlus, 
  FileCheck, 
  Users, 
  Settings, 
  DollarSign, 
  MessageSquare,
  BookOpen, 
  ArrowUpRight,
  ShieldCheck,
  Gauge,
  FileText 
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  link: string;
  color: string;
  category?: string;
}

export const QuickActions = () => {
  const actions: QuickActionProps[] = [
    {
      title: "Add New Vehicle",
      icon: <Car />,
      description: "Register a new vehicle in the system",
      link: "/vehicles/new",
      color: "text-blue-500 dark:text-blue-400",
      category: "fleet"
    },
    {
      title: "Create Rental",
      icon: <CalendarPlus />,
      description: "Create a new rental agreement",
      link: "/rentals/new",
      color: "text-green-500 dark:text-green-400",
      category: "operations"
    },
    {
      title: "Vehicle Inspection",
      icon: <FileCheck />,
      description: "Complete vehicle inspection",
      link: "/inspections/new",
      color: "text-violet-500 dark:text-violet-400",
      category: "fleet"
    },
    {
      title: "New Customer",
      icon: <Users />,
      description: "Add a new customer profile",
      link: "/customers/new", 
      color: "text-amber-500 dark:text-amber-400",
      category: "customers"
    },
    {
      title: "Payment Processing",
      icon: <DollarSign />,
      description: "Process payments and invoices",
      link: "/payments",
      color: "text-emerald-500 dark:text-emerald-400",
      category: "finance"
    },
    {
      title: "Message Center",
      icon: <MessageSquare />,
      description: "View and send customer messages",
      link: "/messages",
      color: "text-sky-500 dark:text-sky-400",
      category: "communications"
    },
    {
      title: "System Settings",
      icon: <Settings />,
      description: "Configure system preferences",
      link: "/settings",
      color: "text-gray-500 dark:text-gray-400",
      category: "admin"
    },
    {
      title: "Generate Reports",
      icon: <BookOpen />,
      description: "Generate custom reports",
      link: "/reports",
      color: "text-rose-500 dark:text-rose-400",
      category: "reports"
    },
    {
      title: "Insurance Status",
      icon: <ShieldCheck />,
      description: "View insurance details",
      link: "/insurance",
      color: "text-teal-500 dark:text-teal-400",
      category: "documents"
    },
    {
      title: "Vehicle Tracking",
      icon: <Gauge />,
      description: "GPS tracking & status",
      link: "/tracking",
      color: "text-indigo-500 dark:text-indigo-400",
      category: "operations"
    },
    {
      title: "Traffic Fines",
      icon: <FileText />,
      description: "Manage traffic violations",
      link: "/traffic-fines",
      color: "text-orange-500 dark:text-orange-400",
      category: "violations"
    }
  ];

  // Group actions by category
  const groupedActions = actions.reduce((acc, action) => {
    const category = action.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(action);
    return acc;
  }, {} as Record<string, QuickActionProps[]>);
  
  const renderActionGroup = (actions: QuickActionProps[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Link 
          key={index} 
          to={action.link}
          className="no-underline h-full"
        >
          <div className={cn(
            "p-4 rounded-lg border border-border/40 shadow-sm", 
            "hover:shadow-md transition-all duration-200 hover:border-border/70", 
            "hover:-translate-y-1 h-full flex flex-col group"
          )}>
            <div className={cn(
              "p-2 w-fit rounded-full mb-2 bg-card relative overflow-hidden",
              action.color,
              "group-hover:ring-2 group-hover:ring-primary/20 transition-all duration-300"
            )}>
              <div className="relative z-10">{action.icon}</div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="text-sm font-medium mt-1">{action.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-2">{action.description}</p>
            <div className="mt-auto flex justify-end">
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {renderActionGroup(actions.slice(0, 8))}
    </div>
  );
};
