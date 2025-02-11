
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export interface CustomerFiltersProps {
  onSearchChange: (value: string) => void;
  onRoleFilter: (value: string) => void;
}

export const CustomerFilters = ({
  onSearchChange,
  onRoleFilter,
}: CustomerFiltersProps) => {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center">
      <div className="w-full md:w-1/3 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Search customers..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 h-12 md:h-10 text-base"
        />
      </div>
      <div className="w-full md:w-1/4">
        <Select onValueChange={onRoleFilter} defaultValue="all">
          <SelectTrigger className="w-full h-12 md:h-10 text-base">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <SelectValue placeholder="Filter by role" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-base py-3">All Roles</SelectItem>
            <SelectItem value="customer" className="text-base py-3">Customer</SelectItem>
            <SelectItem value="staff" className="text-base py-3">Staff</SelectItem>
            <SelectItem value="admin" className="text-base py-3">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
