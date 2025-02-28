
import { useState, useEffect } from "react";
import { Bell, Menu, X } from "lucide-react";
import { UserProfileMenu } from "./UserProfileMenu";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface DashboardHeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const DashboardHeader = ({
  toggleSidebar,
  isSidebarOpen,
}: DashboardHeaderProps) => {
  const [notifications, setNotifications] = useState(5);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Simulate fetching notifications
    const timer = setTimeout(() => {
      setNotifications(Math.floor(Math.random() * 10));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleNotificationsClick = () => {
    toast.info(`You have ${notifications} unread notifications`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <button
        onClick={toggleSidebar}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
      >
        {isSidebarOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle Menu</span>
      </button>
      
      <div className="flex-1">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold hidden sm:inline-block">
            SmartRental Fleet Management
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* SearchBox component has been removed */}
        
        <button
          className="notifications inline-flex items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 relative"
          onClick={handleNotificationsClick}
        >
          <Bell className="h-4 w-4" />
          {notifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {notifications}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </button>
        <UserProfileMenu />
      </div>
    </header>
  );
};
