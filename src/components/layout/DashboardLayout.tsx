
import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TourProvider } from "@/contexts/TourContext";

const tourSteps = [
  {
    target: '.sidebar',
    title: 'Navigation Menu',
    content: 'Access all your important features from here.',
    position: 'right'
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
  return (
    <SidebarProvider>
      <TourProvider steps={tourSteps}>
        <div className="relative flex min-h-screen w-full">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="page-container">
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
