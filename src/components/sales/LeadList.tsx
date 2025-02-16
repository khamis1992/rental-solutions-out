import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesLead } from "@/types/sales.types";
import { useSalesLeads } from "./hooks/useSalesLeads";
import { formatDistanceToNow } from "date-fns";
const statusColors: Record<SalesLead['status'], string> = {
  new: "bg-blue-500",
  document_collection: "bg-yellow-500",
  vehicle_selection: "bg-purple-500",
  agreement_draft: "bg-orange-500",
  ready_for_signature: "bg-indigo-500",
  onboarding: "bg-green-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500"
};
export function LeadList() {
  const {
    data: leads = [],
    isLoading
  } = useSalesLeads();
  const queryClient = useQueryClient();
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const handleStatusChange = async (leadId: string, newStatus: SalesLead['status']) => {
    try {
      const {
        error
      } = await supabase.from("sales_leads").update({
        status: newStatus
      }).eq("id", leadId);
      if (error) throw error;
      toast.success("Lead status updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["sales-leads"]
      });
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error("Failed to update lead status");
    }
  };
  const handleDelete = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const {
        error
      } = await supabase.from("sales_leads").delete().eq("id", leadId);
      if (error) throw error;
      toast.success("Lead deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["sales-leads"]
      });
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    }
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return <ScrollArea className="h-[600px] w-full rounded-md border">
      <div className="p-4 space-y-4">
        <AnimatePresence>
          {leads.map(lead => <motion.div key={lead.id} layout initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{lead.full_name}</CardTitle>
                      <CardDescription>
                        Created {formatDistanceToNow(new Date(lead.created_at))} ago
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[lead.status]}>
                      {lead.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Phone:</span> {lead.phone_number}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {lead.email}
                      </div>
                      <div>
                        <span className="font-medium">Budget:</span> {lead.budget_min} - {lead.budget_max ?? 'No max'}
                      </div>
                      <div>
                        <span className="font-medium">Nationality:</span> {lead.nationality}
                      </div>
                    </div>

                    {expandedLeadId === lead.id && <motion.div initial={{
                  opacity: 0,
                  height: 0
                }} animate={{
                  opacity: 1,
                  height: "auto"
                }} exit={{
                  opacity: 0,
                  height: 0
                }} className="pt-2">
                        <p className="text-sm text-gray-600 mb-2">{lead.notes}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="secondary" size="sm" onClick={() => handleStatusChange(lead.id, "document_collection")} disabled={lead.status === "document_collection"} className="text-background-alt bg-primary-dark">
                            Request Documents
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleStatusChange(lead.id, "vehicle_selection")} disabled={lead.status === "vehicle_selection"} className="text-gray-50 bg-green-500 hover:bg-green-400">
                            Select Vehicle
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(lead.id)}>
                            Delete
                          </Button>
                        </div>
                      </motion.div>}

                    <Button variant="ghost" size="sm" onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}>
                      {expandedLeadId === lead.id ? "Show Less" : "Show More"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>)}
        </AnimatePresence>
      </div>
    </ScrollArea>;
}