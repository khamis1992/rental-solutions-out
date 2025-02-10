
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Car, Truck, User, Calendar, Activity, MoreHorizontal } from "lucide-react";

export const AgreementTableHeader = () => {
  return (
    <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
      <TableRow className="hover:bg-gray-50/50 transition-colors">
        <TableHead className="w-[120px] py-2 font-semibold">
          <div className="flex items-center gap-1.5 text-blue-600 group cursor-pointer">
            <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform truncate">Agreement #</span>
          </div>
        </TableHead>
        <TableHead className="w-[100px] py-2 font-semibold">
          <div className="flex items-center gap-1.5 text-blue-600 group cursor-pointer">
            <Car className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform truncate">License</span>
          </div>
        </TableHead>
        <TableHead className="w-[180px] py-2 font-semibold">
          <div className="flex items-center gap-1.5 text-blue-600 group cursor-pointer">
            <Truck className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform truncate">Vehicle</span>
          </div>
        </TableHead>
        <TableHead className="w-[180px] py-2 font-semibold">
          <div className="flex items-center gap-1.5 text-blue-600 group cursor-pointer">
            <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform truncate">Customer</span>
          </div>
        </TableHead>
        <TableHead className="w-[110px] py-2 font-semibold">
          <div className="flex items-center gap-1.5 text-blue-600 group cursor-pointer">
            <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform truncate">Start</span>
          </div>
        </TableHead>
        <TableHead className="w-[110px] py-2 font-semibold">
          <div className="flex items-center gap-1.5 text-blue-600 group cursor-pointer">
            <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform truncate">End</span>
          </div>
        </TableHead>
        <TableHead className="w-[100px] py-2 font-semibold">
          <div className="flex items-center gap-1.5 text-blue-600 group cursor-pointer">
            <Activity className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform truncate">Status</span>
          </div>
        </TableHead>
        <TableHead className="w-[120px] py-2 font-semibold text-right">
          <div className="flex items-center justify-end gap-1.5 text-blue-600 group cursor-pointer">
            <MoreHorizontal className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:translate-x-0.5 transition-transform truncate">Actions</span>
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
