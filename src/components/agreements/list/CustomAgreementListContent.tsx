
import { useQuery } from "@tanstack/react-query";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Agreement } from "@/types/agreement.types";
import { AgreementTableRow } from "../table/AgreementTableRow";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const CustomAgreementListContent = () => {
  const navigate = useNavigate();

  const { data: agreements = [], isLoading, error } = useQuery({
    queryKey: ["agreements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          customer:customer_id (
            id,
            full_name,
            phone_number,
            email
          ),
          vehicle:vehicle_id (
            id,
            make,
            model,
            year,
            license_plate
          )
        `);

      if (error) throw error;
      return data as Agreement[];
    }
  });

  const handleViewContract = async (id: string) => {
    console.log("View contract", id);
  };

  const handlePrintContract = async (id: string) => {
    console.log("Print contract", id);
  };

  const handleAgreementClick = (id: string) => {
    navigate(`/agreements/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading agreements. Please try again.
      </div>
    );
  }

  if (!agreements.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No agreements found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agreement #</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agreements.map((agreement) => (
            <AgreementTableRow
              key={agreement.id}
              agreement={agreement}
              onViewContract={handleViewContract}
              onPrintContract={handlePrintContract}
              onAgreementClick={handleAgreementClick}
              onNameClick={(id) => console.log('Name clicked:', id)}
              onDeleted={() => console.log('Deleted')}
              onDeleteClick={() => console.log('Delete clicked')}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
