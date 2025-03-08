import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Car, Plus, FileText, DollarSign, Wrench, Users, Key, PanelLeftClose, 
  BarChart2, ClipboardCheck, UploadCloud, Bell, HelpCircle, Calendar, 
  Map, ReceiptText, FileSearch, MessageSquarePlus, Cog, Star, Briefcase,
  BarChart4, TrendingUp, Languages
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActionItem {
  name: string;
  icon: React.ElementType;
  path: string;
  category: 'vehicles' | 'agreements' | 'finance' | 'management' | 'system';
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  description: string;
}

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions: ActionItem[] = [
    {
      name: "Add Vehicle",
      icon: Car,
      path: "/vehicles",
      category: 'vehicles',
      description: "Register a new vehicle in the system"
    },
    {
      name: "New Agreement",
      icon: FileText,
      path: "/agreements/new",
      category: 'agreements',
      badge: {
        text: "Quick",
        variant: "secondary"
      },
      description: "Create a new rental agreement"
    },
    {
      name: "Record Payment",
      icon: DollarSign,
      path: "/finance",
      category: 'finance',
      description: "Record a new payment transaction"
    },
    {
      name: "Schedule Maintenance",
      icon: Wrench,
      path: "/maintenance",
      category: 'vehicles',
      description: "Schedule vehicle maintenance"
    },
    {
      name: "Add Customer",
      icon: Users,
      path: "/customers",
      category: 'management',
      description: "Register a new customer"
    },
    {
      name: "Vehicle Handover",
      icon: Key,
      path: "/vehicles",
      category: 'vehicles',
      description: "Process vehicle handover"
    },
    {
      name: "Reports",
      icon: BarChart2,
      path: "/reports",
      category: 'management',
      description: "View business reports and analytics"
    },
    {
      name: "Inspections",
      icon: ClipboardCheck,
      path: "/vehicles",
      category: 'vehicles',
      description: "Record vehicle inspection results"
    },
    {
      name: "Import Data",
      icon: UploadCloud,
      path: "/settings",
      category: 'system',
      description: "Import data from external sources"
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/dashboard",
      category: 'system',
      badge: {
        text: "3",
        variant: "destructive"
      },
      description: "View system notifications"
    },
    {
      name: "Help & Support",
      icon: HelpCircle,
      path: "/help",
      category: 'system',
      description: "Access help documentation"
    },
    {
      name: "Schedule",
      icon: Calendar,
      path: "/chauffeur-service",
      category: 'management',
      description: "Manage scheduling and bookings"
    },
    {
      name: "Location Tracking",
      icon: Map,
      path: "/location-tracking",
      category: 'vehicles',
      badge: {
        text: "New",
        variant: "default"
      },
      description: "Track vehicle locations"
    },
    {
      name: "Invoices",
      icon: ReceiptText,
      path: "/finance",
      category: 'finance',
      description: "Manage and create invoices"
    },
    {
      name: "Document Search",
      icon: FileSearch,
      path: "/documents",
      category: 'management',
      description: "Search through documents"
    }
  ];

  const categoryIcons = {
    'vehicles': Car,
    'agreements': FileText,
    'finance': DollarSign,
    'management': Briefcase,
    'system': Cog
  };

  const handleAction = (path: string) => {
    navigate(path);
  };

  // Group actions by category
  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, ActionItem[]>);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <span>Quick Actions</span>
          </div>
          <div className="text-xs text-muted-foreground font-normal">
            Most used actions
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedActions).map(([category, categoryActions]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              {categoryIcons[category as keyof typeof categoryIcons] && (
                <div className="h-4 w-4 text-muted-foreground">
                  {React.createElement(categoryIcons[category as keyof typeof categoryIcons], { 
                    className: "h-4 w-4 text-muted-foreground" 
                  })}
                </div>
              )}
              <h3 className="text-sm font-medium text-muted-foreground capitalize">{category}</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {categoryActions.map((action) => (
                <TooltipProvider key={action.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-20 w-full flex flex-col items-center justify-center gap-1 relative hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
                        onClick={() => handleAction(action.path)}
                      >
                        {action.badge && (
                          <Badge 
                            variant={action.badge.variant}
                            className="absolute top-1 right-1 text-[10px] px-1 py-0 min-w-5 h-4 flex items-center justify-center"
                          >
                            {action.badge.text}
                          </Badge>
                        )}
                        <action.icon className="h-6 w-6 text-primary" />
                        <span className="text-xs text-center">{action.name}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
