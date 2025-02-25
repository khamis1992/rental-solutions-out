
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Vehicle } from "@/types/vehicle";
import { VehicleTableContent } from "./VehicleTableContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";

interface VehicleListViewProps {
  vehicles: Vehicle[];
  isLoading?: boolean;
  selectedVehicles: string[];
  onSelectionChange: (selected: string[]) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: () => Promise<void>;
}

export const VehicleListView = ({
  vehicles,
  isLoading,
  selectedVehicles,
  onSelectionChange,
  currentPage,
  totalPages,
  onPageChange,
  onDelete
}: VehicleListViewProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Plate</TableHead>
            <TableHead>Make</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Insurance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <VehicleTableContent 
            vehicles={vehicles}
            onDelete={onDelete} 
          />
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
};
