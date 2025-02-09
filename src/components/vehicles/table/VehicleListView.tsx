
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VehicleTableContent } from "./VehicleTableContent";
import { VehicleTablePagination } from "./VehicleTablePagination";
import { Vehicle } from "@/types/vehicle";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface VehicleListViewProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const VehicleListView = ({
  vehicles,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: VehicleListViewProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!vehicles.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-background rounded-lg border">
        <div className="text-4xl mb-4">🚗</div>
        <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="relative overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[180px] font-semibold">License Plate</TableHead>
              <TableHead className="w-[140px] font-semibold">Make</TableHead>
              <TableHead className="w-[140px] font-semibold">Model</TableHead>
              <TableHead className="w-[100px] font-semibold">Year</TableHead>
              <TableHead className="w-[120px] font-semibold">Status</TableHead>
              <TableHead className="w-[160px] font-semibold">Location</TableHead>
              <TableHead className="w-[160px] font-semibold">Insurance</TableHead>
              <TableHead className="w-[100px] text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <VehicleTableContent
              vehicles={vehicles}
            />
          </TableBody>
        </Table>
      </div>
      
      <div className="border-t">
        <VehicleTablePagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};
