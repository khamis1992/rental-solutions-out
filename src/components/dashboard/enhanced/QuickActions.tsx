
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
  ArrowUpRight 
} from "lucide-react";
import { Link } from "react-router-dom";

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  link: string;
  color: string;
}

export const QuickActions = () => {
  const actions: QuickActionProps[] = [
    {
      title: "Add New Vehicle",
      icon: <Car />,
      description: "Register a new vehicle in the system",
      link: "/vehicles/new",
      color: "text-blue-500 dark:text-blue-400"
    },
    {
      title: "Create Rental",
      icon: <CalendarPlus />,
      description: "Create a new rental agreement",
      link: "/rentals/new",
      color: "text-green-500 dark:text-green-400"
    },
    {
      title: "Record Inspection",
      icon: <FileCheck />,
      description: "Complete vehicle inspection",
      link: "/inspections/new",
      color: "text-violet-500 dark:text-violet-400"
    },
    {
      title: "New Customer",
      icon: <Users />,
      description: "Add a new customer profile",
      link: "/customers/new", 
      color: "text-amber-500 dark:text-amber-400"
    },
    {
      title: "Payment Processing",
      icon: <DollarSign />,
      description: "Process payments and invoices",
      link: "/payments",
      color: "text-emerald-500 dark:text-emerald-400"
    },
    {
      title: "Message Center",
      icon: <MessageSquare />,
      description: "View and send customer messages",
      link: "/messages",
      color: "text-sky-500 dark:text-sky-400"
    },
    {
      title: "System Settings",
      icon: <Settings />,
      description: "Configure system preferences",
      link: "/settings",
      color: "text-gray-500 dark:text-gray-400"
    },
    {
      title: "Reports",
      icon: <BookOpen />,
      description: "Generate custom reports",
      link: "/reports",
      color: "text-rose-500 dark:text-rose-400"
    }
  ];
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Link 
          key={index} 
          to={action.link}
          className="no-underline h-full"
        >
          <div className="p-4 rounded-lg border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 hover:border-border/70 hover:-translate-y-1 h-full flex flex-col">
            <div className={`p-2 w-fit rounded-full mb-2 bg-card ${action.color}`}>
              {action.icon}
            </div>
            <h3 className="text-sm font-medium mt-1">{action.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-2">{action.description}</p>
            <div className="mt-auto flex justify-end">
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
