
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface SalesLead {
  id: string;
  preferred_vehicle_type: string;
  budget_range_min: number;
  budget_range_max: number;
  status: string;
  priority: string;
  created_at: string;
}

export const SalesLeadList = () => {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("sales_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      document_collection: "bg-purple-100 text-purple-800",
      vehicle_selection: "bg-yellow-100 text-yellow-800",
      agreement_draft: "bg-orange-100 text-orange-800",
      ready_for_signature: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle Type</TableHead>
            <TableHead>Budget Range</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.preferred_vehicle_type}</TableCell>
              <TableCell>
                {lead.budget_range_min} - {lead.budget_range_max} QAR
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getStatusColor(lead.status)}>
                  {lead.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{lead.priority}</Badge>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
