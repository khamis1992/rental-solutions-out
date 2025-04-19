import { useQuery } from "@tanstack/react-query";
import { TrafficFineStats } from "./TrafficFineStats";
import { TrafficFineImport } from "./TrafficFineImport";
import { TrafficFinesList } from "./TrafficFinesList";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrafficCone, Car, AlertTriangle, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { fetchVehicleTrafficFinesReport, exportTrafficFinesToPDF } from "../reports/utils/trafficFinesReportUtils";

export function TrafficFinesDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("violation_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: finesCount = 0, refetch } = useQuery({
    queryKey: ["traffic-fines-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('traffic_fines')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: finesData } = useQuery({
    queryKey: ["traffic-fines-report"],
    queryFn: fetchVehicleTrafficFinesReport,
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleDeleteAllFines = async () => {
    try {
      setIsDeleting(true);
      
      // First check if there are any fines to delete
      const { count } = await supabase
        .from('traffic_fines')
        .select('*', { count: 'exact', head: true });
      
      if (!count) {
        toast.info("No traffic fines to delete");
        setIsDeleteDialogOpen(false);
        setIsDeleting(false);
        return;
      }
      
      // Perform the delete operation with improved error handling
      const { error } = await supabase
        .from('traffic_fines')
        .delete()
        .is('id', 'not', null); // This is a safer way to delete all records
      
      if (error) {
        console.error("Error deleting traffic fines:", error);
        throw new Error(error.message || "Failed to delete traffic fines");
      }
      
      // Refetch data after deletion
      await refetch();
      toast.success("All traffic fines have been deleted successfully");
    } catch (error: any) {
      console.error("Error deleting traffic fines:", error);
      toast.error(error.message || "Failed to delete traffic fines. Please try again.");
    } finally {
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      if (!finesData) {
        toast.error("No data available to export");
        return;
      }
      
      await exportTrafficFinesToPDF(
        finesData.vehicleReports,
        finesData.unassignedFines,
        finesData.summary
      );
      
      toast.success("PDF report generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col space-y-6">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-orange-500/0 p-6 border backdrop-blur-sm">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-lg animate-pulse">
                  <TrafficCone className="h-8 w-8 text-orange-500" />
                </div>
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Car className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Traffic Fines Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Monitor and manage traffic violations, fines, and payments efficiently
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={handleExportPDF}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)} 
                disabled={finesCount === 0 || isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete All Fines
              </Button>
            </div>
          </div>
        </div>
        
        <Card className="bg-white/50 backdrop-blur-sm border-orange-500/20">
          <CardContent className="p-6">
            <ErrorBoundary>
              <TrafficFineStats paymentCount={finesCount || 0} />
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors border-orange-500/20">
        <CardContent className="p-6">
          <ErrorBoundary>
            <TrafficFineImport />
          </ErrorBoundary>
        </CardContent>
      </Card>
      
      <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors border-orange-500/20">
        <CardContent className="p-6">
          <ErrorBoundary>
            <TrafficFinesList 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </ErrorBoundary>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete All Traffic Fines
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all traffic fines
              from the system. These records may be needed for accounting, legal, or historical
              reference purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllFines}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
