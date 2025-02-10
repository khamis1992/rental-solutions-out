
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, Clock, Calendar, FileText, 
  Shield, Car, CreditCard, Bell 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SmartNotifications = () => {
  const { data: notifications = [] } = useQuery({
    queryKey: ["smart-notifications"],
    queryFn: async () => {
      // This would typically fetch from a notifications table
      // For now, we'll return mock data
      return [
        {
          id: 1,
          type: "maintenance",
          title: "Maintenance Due",
          description: "3 vehicles require maintenance this week",
          priority: "high",
          icon: Car
        },
        {
          id: 2,
          type: "payment",
          title: "Pending Payments",
          description: "5 payments are due in the next 48 hours",
          priority: "medium",
          icon: CreditCard
        },
        {
          id: 3,
          type: "insurance",
          title: "Insurance Renewal",
          description: "Insurance expires for 2 vehicles next month",
          priority: "low",
          icon: Shield
        }
      ];
    }
  });

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Card className="h-full bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
        <CardTitle className="text-base md:text-lg font-semibold">Notifications</CardTitle>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 md:h-9 md:w-9"
          onClick={() => toast.info("Notifications settings coming soon")}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100%-4rem)] max-h-[400px]">
          <div className="space-y-2 p-4 md:p-6">
            {notifications.map((notification) => (
              <Alert 
                key={notification.id}
                className={`flex items-start gap-3 p-3 md:p-4 rounded-lg border transition-all duration-200 hover:brightness-95 cursor-pointer ${getPriorityStyles(notification.priority)}`}
              >
                <div className="flex-shrink-0 mt-1">
                  <notification.icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <AlertTitle className="text-sm md:text-base font-semibold mb-1 line-clamp-1">
                    {notification.title}
                  </AlertTitle>
                  <AlertDescription className="text-xs md:text-sm line-clamp-2">
                    {notification.description}
                  </AlertDescription>
                </div>
              </Alert>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
