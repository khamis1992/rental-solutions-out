
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PreregisteredForm } from "@/components/sales/PreregisteredForm";
import { LeadList } from "@/components/sales/LeadList";
import { SalesLead } from "@/types/sales.types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Sales() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<SalesLead[]>([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("sales_leads")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data as SalesLead[]);
    } catch (error) {
      toast.error("Error fetching leads");
      console.error("Error:", error);
    }
  };

  const handleLeadCreated = (newLead: SalesLead) => {
    setLeads([newLead, ...leads]);
    toast.success("Lead created successfully");
  };

  const handleLeadUpdated = (updatedLead: SalesLead) => {
    setLeads(leads.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    ));
  };

  const handleLeadDeleted = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from("sales_leads")
        .delete()
        .eq("id", leadId);

      if (error) throw error;

      setLeads(leads.filter((lead) => lead.id !== leadId));
      toast.success("Lead deleted successfully");
    } catch (error) {
      toast.error("Error deleting lead");
      console.error("Error:", error);
    }
  };

  const handleTransferToOnboarding = (leadId: string) => {
    navigate(`/sales/onboarding/${leadId}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Management</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">New Lead</h2>
            <PreregisteredForm onLeadCreated={handleLeadCreated} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">Active Leads</h2>
            <LeadList
              leads={leads}
              onDelete={handleLeadDeleted}
              onTransferToOnboarding={handleTransferToOnboarding}
              onLeadUpdated={handleLeadUpdated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
