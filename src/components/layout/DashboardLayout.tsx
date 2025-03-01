
import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TourProvider } from "@/contexts/TourContext";
import { useIsMobile } from "@/hooks/use-mobile";

const tourSteps = [
  {
    target: '.sidebar',
    title: 'Navigation Menu',
    content: 'Access all your important features from here.',
    position: 'right' // Position for RTL layout
  },
  {
    target: '.notifications',
    title: 'Notifications',
    content: 'Stay updated with important alerts and reminders.',
    position: 'bottom'
  },
  {
    target: '.user-menu',
    title: 'User Settings',
    content: 'Access your profile and preferences here.',
    position: 'bottom'
  }
];

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultCollapsed={isMobile}>
      <TourProvider steps={tourSteps}>
        <div className="flex flex-row-reverse min-h-screen w-full overflow-hidden">
          <div className="sidebar-container border-l shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
            <DashboardSidebar />
          </div>
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="page-container pb-safe">
              <div className="content-wrapper">
                {children || <Outlet />}
              </div>
            </main>
          </div>
        </div>
      </TourProvider>
    </SidebarProvider>
  );
};
