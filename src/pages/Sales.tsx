
import { PreregisteredForm } from "@/components/sales/PreregisteredForm";
import { LeadList } from "@/components/sales/LeadList";
import { useState, useEffect } from "react";
import { SalesLead } from "@/types/sales.types";
import { supabase } from "@/integrations/supabase/client";

export default function Sales() {
  const [leads] = useState<SalesLead[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<{ id: string; name: string; status: string }[]>([]);

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

  const handleSubmit = async (data: any) => {
    console.log("Form submitted:", data);
  };

  const handleEdit = (lead: SalesLead) => {
    console.log("Edit lead:", lead);
  };

  const handleDelete = async (id: string) => {
    console.log("Delete lead:", id);
  };

  const handleTransferToOnboarding = async (lead: SalesLead) => {
    console.log("Transfer to onboarding:", lead);
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
