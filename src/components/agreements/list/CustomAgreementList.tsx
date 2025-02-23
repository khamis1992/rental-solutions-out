
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  LayoutGrid,
  LayoutList,
  Search,
  Eye,
  Trash2,
  FileText,
  Calendar,
  Car,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Agreement } from "@/types/agreement.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";

interface CustomAgreementListProps {
  agreements: Agreement[];
  onViewDetails: (agreement: Agreement) => void;
  onDelete: (agreement: Agreement) => void;
  viewMode?: "grid" | "list";
}

export function CustomAgreementList({
  agreements,
  onViewDetails,
  onDelete,
  viewMode: initialViewMode = "grid",
}: CustomAgreementListProps) {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter and sort agreements
  const filteredAgreements = agreements
    .filter((agreement) => {
      const matchesSearch =
        !searchTerm ||
        agreement.agreement_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agreement.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agreement.vehicle?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || agreement.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAgreements.length / itemsPerPage);
  const paginatedAgreements = filteredAgreements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#98BBF5]/10 text-[#1C304F] border-[#98BBF5]";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500";
      case "expired":
        return "bg-red-500/10 text-red-700 border-red-500";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full sm:w-auto relative">
          <Input
            placeholder="Search agreements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 border-[#98BBF5]/30 focus:border-[#98BBF5] focus:ring-[#98BBF5]/50"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#1C304F]/50" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] border-[#98BBF5]/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] border-[#98BBF5]/30">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1 border border-[#98BBF5]/30 rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="text-[#1C304F] hover:text-[#98BBF5]"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="text-[#1C304F] hover:text-[#98BBF5]"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Agreement List */}
      <div
        className={cn(
          "grid gap-4",
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        )}
      >
        {paginatedAgreements.map((agreement) => (
          <Card
            key={agreement.id}
            className={cn(
              "transition-all duration-300 hover:shadow-lg hover:shadow-[#98BBF5]/20 hover:-translate-y-1",
              `border-l-4 ${getStatusColor(agreement.status)}`
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-[#1C304F]">
                    Agreement #{agreement.agreement_number}
                  </h3>
                  <p className="text-sm text-[#1C304F]/70">
                    Type: {agreement.agreement_type}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn("capitalize", getStatusColor(agreement.status))}
                >
                  {agreement.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#1C304F]/70">
                  <Car className="h-4 w-4" />
                  <span className="text-sm">
                    {agreement.vehicle?.year} {agreement.vehicle?.make}{" "}
                    {agreement.vehicle?.model}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#1C304F]/70">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{agreement.customer?.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-[#1C304F]/70">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {format(new Date(agreement.created_at), "PPP")}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(agreement)}
                className="hover:bg-[#98BBF5]/10 hover:text-[#1C304F] border-[#98BBF5]/30"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => onDelete(agreement)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {paginatedAgreements.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-[#98BBF5] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#1C304F] mb-2">
            No agreements found
          </h3>
          <p className="text-[#1C304F]/70">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating a new agreement"}
          </p>
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-[#98BBF5]/30 hover:bg-[#98BBF5]/10"
          >
            Previous
          </Button>
          <span className="py-2 px-4 text-sm text-[#1C304F]">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-[#98BBF5]/30 hover:bg-[#98BBF5]/10"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
