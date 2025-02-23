
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
  Search,
  Eye,
  Trash2,
  FileText,
  Calendar,
  Car,
  User,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  FileCheck,
  ArrowUpDown,
  Tag,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { toast } from "sonner";

interface CustomAgreementListProps {
  agreements: Agreement[];
  onViewDetails: (agreement: Agreement) => void;
  onDelete: (agreement: Agreement) => void;
}

export function CustomAgreementList({
  agreements,
  onViewDetails,
  onDelete,
}: CustomAgreementListProps) {
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
        return "bg-green-500/10 text-green-500 border-green-500 shadow-green-500/10";
      case "pending":
        return "bg-[#FFC344]/10 text-[#FFC344] border-[#FFC344] shadow-[#FFC344]/10";
      case "expired":
        return "bg-[#F83A26]/10 text-[#F83A26] border-[#F83A26] shadow-[#F83A26]/10";
      default:
        return "bg-[#D1D4D7]/10 text-[#D1D4D7] border-[#D1D4D7] shadow-[#D1D4D7]/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "expired":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#D1D4D7]/20">
        <div className="flex-1 w-full sm:w-auto relative">
          <Input
            placeholder="Search agreements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 border-[#D1D4D7] bg-gray-50/50 hover:bg-white focus:bg-white transition-colors"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#2D2942]/40" />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] border-[#D1D4D7]">
              <Tag className="h-4 w-4 mr-2 text-[#2D2942]/60" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] border-[#D1D4D7]">
              <ArrowUpDown className="h-4 w-4 mr-2 text-[#2D2942]/60" />
              <SelectValue placeholder="Sort by Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Agreement List */}
      <div className="grid grid-cols-1 gap-4">
        {paginatedAgreements.map((agreement) => (
          <Card
            key={agreement.id}
            className={cn(
              "transition-all duration-200",
              "hover:shadow-lg hover:translate-y-[-1px]",
              "border-l-4 bg-white/60 backdrop-blur-sm",
              getStatusColor(agreement.status)
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-[#2D2942] flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-[#2D2942]/60" />
                      Agreement #{agreement.agreement_number}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag className="h-4 w-4 text-[#2D2942]/40" />
                      <p className="text-sm text-[#2D2942]/60">
                        {agreement.agreement_type}
                      </p>
                    </div>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "capitalize flex items-center gap-1.5 px-3 py-1",
                          getStatusColor(agreement.status)
                        )}
                      >
                        {getStatusIcon(agreement.status)}
                        {agreement.status}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Agreement Status</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-[#2D2942]/5 transition-colors">
                        <Car className="h-4 w-4 text-[#2D2942]/60" />
                        <span className="text-sm text-[#2D2942]/80">
                          {agreement.vehicle?.year} {agreement.vehicle?.make}{" "}
                          {agreement.vehicle?.model}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Vehicle Details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-[#2D2942]/5 transition-colors">
                        <User className="h-4 w-4 text-[#2D2942]/60" />
                        <span className="text-sm text-[#2D2942]/80">
                          {agreement.customer?.full_name}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Customer Information</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-[#2D2942]/5 transition-colors">
                        <Calendar className="h-4 w-4 text-[#2D2942]/60" />
                        <span className="text-sm text-[#2D2942]/80">
                          {format(new Date(agreement.created_at), "PPP")}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Creation Date</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-4 border-t border-[#D1D4D7]/20">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(agreement)}
                      className="border-[#2D2942]/20 hover:bg-[#2D2942]/5 hover:border-[#2D2942]/30 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View Details
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Agreement Details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(agreement)}
                      className="text-[#F83A26] border-[#F83A26]/20 hover:bg-[#F83A26]/5 hover:border-[#F83A26]/30 hover:text-[#F83A26] transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Agreement</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {paginatedAgreements.length === 0 && (
        <div className="text-center py-12 px-4 rounded-lg border border-[#D1D4D7]/20 bg-white">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2D2942]/5 flex items-center justify-center">
            <FileText className="h-8 w-8 text-[#2D2942]/40" />
          </div>
          <h3 className="text-lg font-medium text-[#2D2942] mb-2">
            No agreements found
          </h3>
          <p className="text-[#2D2942]/60">
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
            className="border-[#D1D4D7] hover:bg-[#2D2942]/5 transition-colors"
          >
            Previous
          </Button>
          <span className="py-2 px-4 text-sm text-[#2D2942]/60 bg-white rounded-md border border-[#D1D4D7]">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-[#D1D4D7] hover:bg-[#2D2942]/5 transition-colors"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
