
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { LeadCommunication as LeadCommunicationType } from "@/types/sales.types";
import { Loader2 } from "lucide-react";

interface LeadCommunicationProps {
  leadId: string;
}

interface TeamMemberProfile {
  id: string;
  full_name: string;
  hire_date: string;
  role: string;
  user_id: string;
  targets: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const LeadCommunication = ({ leadId }: LeadCommunicationProps) => {
  const { data: communications, isLoading } = useQuery({
    queryKey: ["lead-communications", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_communications")
        .select(`
          *,
          profiles (
            id,
            full_name,
            hire_date,
            role,
            user_id,
            targets,
            created_at,
            updated_at
          )
        `)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching communications:", error);
        throw error;
      }

      // Transform the data to match our type, handling the profiles relationship safely
      return data.map(comm => ({
        ...comm,
        profiles: comm.profiles ? {
          full_name: (comm.profiles as TeamMemberProfile).full_name
        } : undefined
      })) as LeadCommunicationType[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!communications || communications.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No communication history found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {communications.map((comm) => (
        <Card key={comm.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  {comm.profiles?.full_name || "System"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(comm.created_at!), "PPp")}
                </div>
                <div className="mt-2">{comm.content}</div>
              </div>
              <Badge>{comm.type}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
