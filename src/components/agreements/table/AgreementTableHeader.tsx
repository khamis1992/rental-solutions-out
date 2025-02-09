
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Car, Truck, User, Calendar, Activity, MoreHorizontal } from "lucide-react";

export const AgreementTableHeader = () => {
  return (
    <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
      <TableRow className="hover:bg-gray-50/50 transition-colors">
        <TableHead className="w-[150px] font-semibold">
          <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer">
            <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform">Agreement Number</span>
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold">
          <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer">
            <Car className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform">License Plate</span>
          </div>
        </TableHead>
        <TableHead className="w-[200px] font-semibold">
          <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer">
            <Truck className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform">Vehicle</span>
          </div>
        </TableHead>
        <TableHead className="w-[200px] font-semibold">
          <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer">
            <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform">Customer Name</span>
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold">
          <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer">
            <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform">Start Date</span>
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold">
          <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer">
            <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform">End Date</span>
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold">
          <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer">
            <Activity className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform">Status</span>
          </div>
        </TableHead>
        <TableHead className="text-right w-[150px] font-semibold">
          <div className="flex items-center justify-end gap-2 text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer">
            <MoreHorizontal className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform">Actions</span>
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
