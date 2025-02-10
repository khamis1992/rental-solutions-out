
import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto pt-[var(--header-height,56px)]">
            <div className="container mx-auto h-full p-4 md:p-6 lg:p-8">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
