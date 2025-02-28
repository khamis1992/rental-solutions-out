
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MaintenanceHistoryProps {
  vehicleId: string;
}

export const MaintenanceHistory = ({ vehicleId }: MaintenanceHistoryProps) => {
  const { data: records, isLoading } = useQuery({
    queryKey: ["maintenance", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="bg-muted/20">
        <CardTitle className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Wrench className="h-4 w-4 text-primary" />
          </div>
          Maintenance History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : records?.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No maintenance history found for this vehicle
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records?.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{record.service_type}</TableCell>
                    <TableCell>
                      {new Date(record.scheduled_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>{formatCurrency(record.cost || 0)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          record.status === "completed"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : record.status === "in_progress"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : record.status === "urgent"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
