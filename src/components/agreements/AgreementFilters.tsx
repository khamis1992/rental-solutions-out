
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search } from "lucide-react";

export interface AgreementFiltersProps {
  onSearchChange?: (value: string) => void;
  onStatusFilter?: (value: string) => void;
}

export const AgreementFilters = ({
  onSearchChange,
  onStatusFilter,
}: AgreementFiltersProps) => {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center">
      <div className="w-full md:w-1/3 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Search agreements..."
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-11 h-12 md:h-10 text-base"
        />
      </div>
      <div className="w-full md:w-1/4">
        <Select onValueChange={onStatusFilter} defaultValue="all">
          <SelectTrigger className="w-full h-12 md:h-10 text-base">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
