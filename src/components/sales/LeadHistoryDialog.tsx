
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { SalesLead } from "@/types/sales.types";
import { Badge } from "@/components/ui/badge";

interface LeadHistoryEntry {
  id: string;
  created_at: string;
  changes: {
    changed_fields: {
      [key: string]: {
        old: any;
        new: any;
      } | null;
    };
  };
  notes: string;
}

interface LeadHistoryDialogProps {
  lead: SalesLead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadHistoryDialog({ lead, open, onOpenChange }: LeadHistoryDialogProps) {
  const [history, setHistory] = useState<LeadHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && lead) {
      fetchLeadHistory();
    }
  }, [open, lead]);

  const fetchLeadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_lead_history')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data);
    } catch (error) {
      console.error('Error fetching lead history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFieldName = (field: string) => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderChangeValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Lead History - {lead.full_name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-center text-muted-foreground">No history available</p>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {format(new Date(entry.created_at), 'PPp')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {entry.notes}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(entry.changes.changed_fields).map(([field, change]) => {
                      if (!change) return null;
                      return (
                        <div key={field} className="grid grid-cols-3 gap-2 text-sm">
                          <span className="font-medium">{formatFieldName(field)}</span>
                          <div className="text-rose-500/70">
                            {renderChangeValue(change.old)}
                          </div>
                          <div className="text-emerald-500/70">
                            {renderChangeValue(change.new)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
