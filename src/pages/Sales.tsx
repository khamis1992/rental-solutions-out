
import { PreregisteredForm } from "@/components/sales/PreregisteredForm";
import { LeadList } from "@/components/sales/LeadList";
import { useState, useEffect } from "react";
import { SalesLead, CreateLeadDTO } from "@/types/sales.types";
import { supabase } from "@/integrations/supabase/client";

export default function Sales() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<{ id: string; name: string; status: string }[]>([]);

  // Fetch leads
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching leads:", error);
        return;
      }

      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  useEffect(() => {
    async function fetchVehicleTypes() {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('make, model')
          .eq('status', 'available');
        
        if (error) {
          console.error("Error fetching vehicle types:", error);
          return;
        }

        // Create unique vehicle types from makes and models
        const types = Array.from(new Set(data.map(v => `${v.make} ${v.model}`)))
          .map((name, index) => ({
            id: index.toString(),
            name,
            status: 'active'
          }));

        setVehicleTypes(types);
      } catch (error) {
        console.error("Error fetching vehicle types:", error);
      }
    }

    fetchVehicleTypes();
  }, []);

  const handleSubmit = async (data: CreateLeadDTO) => {
    try {
      const { data: newLead, error } = await supabase
        .from('sales_leads')
        .insert([{
          ...data,
          status: 'new',
          onboarding_progress: {
            initial_payment: false,
            agreement_creation: false,
            customer_conversion: false
          }
        }])
        .select()
        .single();

      if (error) throw error;

      // Update the leads list with the new lead
      setLeads(currentLeads => [newLead, ...currentLeads]);
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating lead:", error);
      return Promise.reject(error);
    }
  };

  const handleEdit = (lead: SalesLead) => {
    console.log("Edit lead:", lead);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales_leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update the leads list by removing the deleted lead
      setLeads(currentLeads => currentLeads.filter(lead => lead.id !== id));
    } catch (error) {
      console.error("Error deleting lead:", error);
      throw error;
    }
  };

  const handleTransferToOnboarding = async (lead: SalesLead) => {
    try {
      const { error } = await supabase
        .from('sales_leads')
        .update({ status: 'in_onboarding' })
        .eq('id', lead.id);

      if (error) throw error;

      // Update the leads list with the updated status
      setLeads(currentLeads => 
        currentLeads.map(l => 
          l.id === lead.id ? { ...l, status: 'in_onboarding' } : l
        )
      );
    } catch (error) {
      console.error("Error transferring lead:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Sales Management</h1>
      
      <PreregisteredForm 
        vehicleTypes={vehicleTypes}
        onSubmit={handleSubmit}
      />

      <LeadList
        leads={leads}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTransferToOnboarding={handleTransferToOnboarding}
      />
    </div>
  );
}
