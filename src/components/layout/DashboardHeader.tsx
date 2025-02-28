
import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { NotificationsButton } from "@/components/layout/NotificationsButton";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";

interface DashboardHeaderProps {
  onMenuButtonClick: () => void;
}

export const DashboardHeader = ({ onMenuButtonClick }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center px-4 h-16 border-b sticky top-0 bg-background z-30">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuButtonClick}
        className="md:hidden"
        aria-label="Toggle menu"
      >
        <MenuIcon className="h-5 w-5" />
      </Button>
      <div className="ml-auto flex items-center space-x-4">
        <NotificationsButton />
        <UserProfileMenu />
      </div>
    </div>
  );
};
