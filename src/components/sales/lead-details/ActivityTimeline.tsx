
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface ActivityTimelineProps {
  leadId: string;
}

interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string | null;
  created_at: string;
  performed_by: string | null;
  metadata: Record<string, any>;
}

export function ActivityTimeline({ leadId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LeadActivity[];
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "status_changed":
        return "🔄";
      case "note_added":
        return "📝";
      case "email_sent":
        return "📧";
      case "call_made":
        return "📞";
      default:
        return "📎";
    }
  };

  if (isLoading) {
    return <div>Loading activities...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
        <CardDescription>Recent activities and updates for this lead</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities?.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 border-l-2 border-muted pl-4 pb-4"
              >
                <div className="text-xl">{getActivityIcon(activity.activity_type)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.created_at), "PPp")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
