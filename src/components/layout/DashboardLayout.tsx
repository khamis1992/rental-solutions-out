
import { ReactNode, useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TourProvider } from "@/contexts/TourContext";
import { useIsMobile } from "@/hooks/use-mobile";

const tourSteps = [
  {
    target: '.sidebar',
    title: 'قائمة التنقل',
    content: 'قم بالوصول إلى جميع الميزات المهمة من هنا.',
    position: 'right'
  },
  {
    target: '.notifications',
    title: 'الإشعارات',
    content: 'ابق على اطلاع بالتنبيهات والتذكيرات المهمة.',
    position: 'bottom'
  },
  {
    target: '.user-menu',
    title: 'إعدادات المستخدم',
    content: 'قم بالوصول إلى ملفك الشخصي وتفضيلاتك هنا.',
    position: 'bottom'
  }
];

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  
  // Apply RTL direction to document
  useEffect(() => {
    // Force RTL direction
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
    document.documentElement.classList.add("rtl-layout");
    document.body.classList.add("rtl-mode");
    
    // Cleanup on unmount
    return () => {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
      document.documentElement.classList.remove("rtl-layout");
      document.body.classList.remove("rtl-mode");
    };
  }, []);
  
  return (
    <SidebarProvider defaultCollapsed={isMobile}>
      <TourProvider steps={tourSteps}>
        <div className="relative flex min-h-screen w-full rtl" dir="rtl" style={{ direction: 'rtl' }}>
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="page-container pb-safe">
              <div className="content-wrapper">
                {children || <Outlet />}
              </div>
            </main>
          </div>
          <DashboardSidebar />
        </div>
      </TourProvider>
    </SidebarProvider>
  );
};
