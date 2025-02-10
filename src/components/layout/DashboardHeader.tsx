
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotificationsButton } from "./NotificationsButton";
import { UserProfileMenu } from "./UserProfileMenu";

export const DashboardHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container h-[var(--header-height,56px)]">
        <div className="flex h-full items-center justify-between gap-2 md:gap-4 px-4">
          <div className="flex items-center">
            <div className="font-semibold text-base md:text-lg hover:text-primary transition-colors">
              Rental Solution
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <NotificationsButton />
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 md:h-10 md:w-10 hover:bg-primary/10 transition-colors"
              onClick={() => navigate("/settings")}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <UserProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
