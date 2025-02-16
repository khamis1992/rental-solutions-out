
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalesLead } from "@/types/sales.types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Edit, History, Trash2 } from "lucide-react";
import { EditLeadDialog } from "./EditLeadDialog";
import { LeadHistoryDialog } from "./LeadHistoryDialog";

interface LeadListProps {
  leads: SalesLead[];
  onDelete: (id: string) => void;
  onTransferToOnboarding: (id: string) => void;
  onLeadUpdated: (lead: SalesLead) => void;
}

export function LeadList({ leads, onDelete, onTransferToOnboarding, onLeadUpdated }: LeadListProps) {
  const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-500",
      document_collection: "bg-yellow-500",
      vehicle_selection: "bg-purple-500",
      agreement_draft: "bg-orange-500",
      ready_for_signature: "bg-green-500",
      onboarding: "bg-cyan-500",
      completed: "bg-emerald-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="animate-fade-in">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.full_name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(new Date(lead.created_at))}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setSelectedLead(lead);
                        setHistoryDialogOpen(true);
                      }}
                    >
                      <History className="h-4 w-4" />
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setSelectedLead(lead);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(lead.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="default"
                      onClick={() => onTransferToOnboarding(lead.id)}
                    >
                      Transfer to Onboarding
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedLead && (
        <>
          <EditLeadDialog
            lead={selectedLead}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onLeadUpdated={onLeadUpdated}
          />
          <LeadHistoryDialog
            lead={selectedLead}
            open={historyDialogOpen}
            onOpenChange={setHistoryDialogOpen}
          />
        </>
      )}
    </div>
  );
}
