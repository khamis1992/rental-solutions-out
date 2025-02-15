
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useLeadDetails } from "@/hooks/sales/useLeadDetails";

interface LeadDetailsProps {
  leadId: string;
}

export const LeadDetails = ({ leadId }: LeadDetailsProps) => {
  const { lead, isLoading } = useLeadDetails(leadId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!lead) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{lead.full_name}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{lead.phone_number}</span>
              {lead.email && (
                <>
                  <Mail className="h-4 w-4 ml-2" />
                  <span>{lead.email}</span>
                </>
              )}
            </div>
          </div>
          <Badge variant={lead.priority === 'high' ? "destructive" : "secondary"}>
            {lead.priority} priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <h3 className="font-semibold mb-2">Lead Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p>{lead.lead_source || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="capitalize">{lead.status.replace(/_/g, " ")}</p>
              </div>
              {lead.next_follow_up && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Next Follow-up</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(lead.next_follow_up), "PPP")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {lead.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">{lead.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
