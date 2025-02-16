
import { PreregisteredForm } from "@/components/sales/PreregisteredForm";
import { LeadList } from "@/components/sales/LeadList";
import { useState } from "react";
import { SalesLead } from "@/types/sales.types";

export default function Sales() {
  // This is a placeholder for now - we'll implement the actual data fetching later
  const [leads] = useState<SalesLead[]>([]);
  const vehicleTypes = [
    { id: "1", name: "Sedan", status: "active" },
    { id: "2", name: "SUV", status: "active" },
    { id: "3", name: "Van", status: "inactive" }
  ];

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
