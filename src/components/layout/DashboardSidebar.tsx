
import { 
  LayoutDashboard, CarFront, Users, FileText, Wrench, 
  DollarSign, AlertTriangle, BarChart3, Archive,
  Building2, Scale, HelpCircle, ChevronRight, 
  ChevronLeft, Activity, Menu, MapPin
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

interface MenuItem {
  icon: React.ComponentType;
  label: string;
  href: string;
  description: string;
}

const menuGroups: MenuGroup[] = [
  {
    label: "Core Operations",
    items: [
      { 
        icon: LayoutDashboard, 
        label: "Dashboard", 
        href: "/",
        description: "Overview and key metrics"
      },
      { 
        icon: CarFront, 
        label: "Vehicles", 
        href: "/vehicles",
        description: "Manage vehicle fleet"
      },
      { 
        icon: Wrench, 
        label: "Maintenance", 
        href: "/maintenance",
        description: "Vehicle maintenance tracking"
      },
    ]
  },
  {
    label: "Customer Management",
    items: [
      { 
        icon: Users, 
        label: "Customers", 
        href: "/customers",
        description: "Customer database"
      },
      { 
        icon: FileText, 
        label: "Agreements", 
        href: "/agreements",
        description: "Rental agreements"
      },
    ]
  },
  {
    label: "Financial",
    items: [
      { 
        icon: DollarSign, 
        label: "Finance", 
        href: "/finance",
        description: "Financial management"
      },
      { 
        icon: AlertTriangle, 
        label: "Traffic Fines", 
        href: "/traffic-fines",
        description: "Manage traffic violations"
      },
      { 
        icon: BarChart3, 
        label: "Remaining Amount", 
        href: "/remaining-amount",
        description: "Outstanding payments"
      },
    ]
  },
  {
    label: "Services",
    items: [
      { 
        icon: Building2, 
        label: "Chauffeur Service", 
        href: "/chauffeur-service",
        description: "Driver services"
      },
    ]
  },
  {
    label: "Business Intelligence",
    items: [
      { 
        icon: Activity, 
        label: "Reports", 
        href: "/reports",
        description: "Business analytics"
      },
      { 
        icon: MapPin, 
        label: "Location Tracking", 
        href: "/location-tracking",
        description: "Real-time location monitoring"
      },
      { 
        icon: Archive, 
        label: "Audit", 
        href: "/audit",
        description: "System audit logs"
      },
    ]
  },
  {
    label: "Support",
    items: [
      { 
        icon: Scale, 
        label: "Legal", 
        href: "/legal",
        description: "Legal documentation"
      },
      { 
        icon: HelpCircle, 
        label: "Help", 
        href: "/help",
        description: "Support and documentation"
      },
    ]
  },
];

export const DashboardSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { session, isLoading } = useSessionContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isMobileMenuOpen]);

  const renderSidebarContent = () => (
    <SidebarContent className="flex flex-col h-full">
      <div className="flex h-14 items-center border-b px-4 justify-between bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        {!isCollapsed && (
          <span className="font-semibold text-lg bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            Rental Solutions
          </span>
        )}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2">
        {menuGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            {!isCollapsed && (
              <SidebarGroupLabel className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, itemIndex) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <SidebarMenuItem key={itemIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
                              "hover:bg-gray-100 active:bg-gray-200 group",
                              "touch-manipulation",
                              isActive && "bg-gray-100 text-gray-900"
                            )}
                          >
                            <Link 
                              to={item.href} 
                              className="flex items-center gap-3 w-full" 
                              onClick={closeMobileMenu}
                            >
                              <item.icon className={cn(
                                "h-5 w-5 transition-transform group-hover:scale-110",
                                isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"
                              )} />
                              {!isCollapsed && (
                                <span className={cn(
                                  "font-medium text-sm transition-colors",
                                  isActive ? "text-gray-900" : "text-gray-700"
                                )}>
                                  {item.label}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right" className="ml-2">
                            <div className="text-sm font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </div>
    </SidebarContent>
  );

  if (isLoading) {
    return (
      <Sidebar className="border-r animate-pulse">
        <SidebarContent>
          <div className="flex h-14 items-center border-b px-6">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded"></div>
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  if (isMobile) {
    return (
      <>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <button
              ref={menuButtonRef}
              className="fixed top-3 left-4 z-[100] p-2.5 rounded-lg bg-white shadow-lg hover:bg-gray-50 active:bg-gray-100 transition-colors ring-1 ring-black/5"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-[280px] p-0 border-r bg-white"
            onInteractOutside={closeMobileMenu}
            onEscapeKeyDown={closeMobileMenu}
          >
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <TooltipProvider>
      <Sidebar className={cn(
        "border-r transition-all duration-300 bg-gradient-to-b from-white to-gray-50",
        isCollapsed ? "w-[70px]" : "w-[280px]"
      )}>
        {renderSidebarContent()}
      </Sidebar>
    </TooltipProvider>
  );
};
