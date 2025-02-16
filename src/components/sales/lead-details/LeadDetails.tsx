
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesLead } from "@/types/sales-lead";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTimeline } from "./ActivityTimeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LeadNotes } from "./LeadNotes";
import { LeadCommunications } from "../email/LeadCommunications";

interface LeadDetailsProps {
  leadId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetails({ leadId, open, onOpenChange }: LeadDetailsProps) {
  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error) throw error;
      return data as SalesLead;
    },
  });

  if (isLoading) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "converted":
        return "bg-green-500";
      case "qualified":
        return "bg-blue-500";
      case "unqualified":
        return "bg-red-500";
      case "contacted":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{lead?.full_name}</span>
            <Badge
              variant="outline"
              className={`${getStatusColor(lead?.status || "")} text-white`}
            >
              {lead?.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Lead details and activity history
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Card className="mb-6">
            <CardContent className="grid grid-cols-2 gap-4 pt-6">
              <div>
                <p className="text-sm font-medium">Contact Information</p>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">Email: {lead?.email || "Not provided"}</p>
                  <p className="text-sm">
                    Phone: {lead?.phone_number || "Not provided"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Vehicle Preferences</p>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    Type: {lead?.preferred_vehicle_type || "Not specified"}
                  </p>
                  <p className="text-sm">
                    Budget:{" "}
                    {lead?.budget_min && lead?.budget_max
                      ? `$${lead.budget_min.toLocaleString()} - $${lead.budget_max.toLocaleString()}`
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="activity" className="w-full">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <ActivityTimeline leadId={leadId} />
            </TabsContent>

            <TabsContent value="communications" className="mt-4">
              <LeadCommunications
                leadId={leadId}
                leadEmail={lead?.email}
                phoneNumber={lead?.phone_number}
              />
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <LeadNotes leadId={leadId} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
