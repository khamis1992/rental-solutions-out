
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  User, 
  Phone, 
  MapPin, 
  FileCheck, 
  Files, 
  MoreHorizontal 
} from "lucide-react";

export const CustomerTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="hover:bg-muted/50 border-b border-border/50">
        <TableHead className="py-3 text-xs font-medium">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>Name</span>
          </div>
        </TableHead>
        <TableHead className="py-3 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>Phone</span>
          </div>
        </TableHead>
        <TableHead className="py-3 text-xs font-medium">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>Address</span>
          </div>
        </TableHead>
        <TableHead className="py-3 text-xs font-medium">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-muted-foreground" />
            <span>Driver License</span>
          </div>
        </TableHead>
        <TableHead className="py-3 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Files className="w-4 h-4 text-muted-foreground" />
            <span>Documents</span>
          </div>
        </TableHead>
        <TableHead className="py-3 text-xs font-medium text-right">
          <div className="flex items-center justify-end gap-2">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            <span>Actions</span>
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
