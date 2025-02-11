
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
        <div className="flex-1 flex flex-col min-h-screen relative isolate">
          <DashboardHeader />
          <main className="flex-1 pt-[var(--header-height,56px)] px-4 md:px-6 lg:px-8 mx-auto w-full max-w-7xl overflow-y-auto">
            <div className="py-4 md:py-6 lg:py-8">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
