
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CustomAgreementListProps {
  viewMode: "grid" | "list";
}

export const CustomAgreementList = ({ viewMode }: CustomAgreementListProps) => {
  const navigate = useNavigate();
  
  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ["agreements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          customer:customer_id (
            id,
            full_name,
            email,
            phone_number
          ),
          vehicle:vehicle_id (
            id,
            make,
            model,
            year,
            license_plate
          )
        `);

      if (error) {
        toast.error("Failed to load agreements");
        throw error;
      }

      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "terminated":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agreements.map((agreement) => (
          <Card
            key={agreement.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/agreements/${agreement.id}`)}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{agreement.agreement_number}</h3>
                  <p className="text-sm text-gray-600">{agreement.customer?.full_name}</p>
                </div>
                <Badge className={getStatusBadgeColor(agreement.status)}>
                  {agreement.status}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>Vehicle: {agreement.vehicle?.make} {agreement.vehicle?.model}</p>
                <p>License: {agreement.vehicle?.license_plate}</p>
              </div>

              <div className="text-sm text-gray-500 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs uppercase">Start Date</p>
                  <p>{formatDateToDisplay(agreement.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase">End Date</p>
                  <p>{formatDateToDisplay(agreement.end_date)}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agreement #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agreements.map((agreement) => (
            <TableRow
              key={agreement.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/agreements/${agreement.id}`)}
            >
              <TableCell className="font-medium">{agreement.agreement_number}</TableCell>
              <TableCell>{agreement.customer?.full_name}</TableCell>
              <TableCell>{agreement.vehicle?.license_plate}</TableCell>
              <TableCell>{formatDateToDisplay(agreement.start_date)}</TableCell>
              <TableCell>{formatDateToDisplay(agreement.end_date)}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(agreement.status)}>
                  {agreement.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
