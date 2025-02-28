import { Button } from "@/components/ui/button";

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
        {/* Menu button without icon */}
      </Button>
      <div className="ml-auto flex items-center space-x-4">
        {/* All icons and components removed */}
      </div>
    </div>
  );
};
