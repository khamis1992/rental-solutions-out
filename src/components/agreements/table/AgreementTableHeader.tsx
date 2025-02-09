
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Car, Truck, User, Calendar, Activity, MoreHorizontal } from "lucide-react";

export const AgreementTableHeader = () => {
  return (
    <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
      <TableRow>
        <TableHead className="w-[150px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            Agreement Number
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-blue-500" />
            License Plate
          </div>
        </TableHead>
        <TableHead className="w-[200px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-500" />
            Vehicle
          </div>
        </TableHead>
        <TableHead className="w-[200px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            Customer Name
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Start Date
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            End Date
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            Status
          </div>
        </TableHead>
        <TableHead className="text-right w-[150px] font-semibold text-primary">
          <div className="flex items-center justify-end gap-2">
            <MoreHorizontal className="h-4 w-4 text-blue-500" />
            Actions
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
