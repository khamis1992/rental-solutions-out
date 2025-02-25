
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
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Tag,
  AlertTriangle,
  BellRing,
  Shield,
  FileCheck,
  Timer,
  History
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { type Agreement } from "@/types/agreement.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, differenceInDays } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedAgreementListProps {
  agreements: Agreement[];
  onViewDetails: (agreement: Agreement) => void;
  onDelete: (agreement: Agreement) => void;
  viewMode?: "grid" | "list";
}

export function EnhancedAgreementList({
  agreements,
  onViewDetails,
  onDelete,
  viewMode: initialViewMode = "grid",
}: EnhancedAgreementListProps) {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle className="h-3.5 w-3.5 animate-pulse" />,
          text: "Active"
        };
      case "pending_payment":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Clock className="h-3.5 w-3.5" />,
          text: "Pending Payment"
        };
      case "pending_deposit":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <CreditCard className="h-3.5 w-3.5" />,
          text: "Pending Deposit"
        };
      case "closed":
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: <FileCheck className="h-3.5 w-3.5" />,
          text: "Closed"
        };
      default:
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          text: status
        };
    }
  };

  const getPaymentStatusInfo = (agreement: Agreement) => {
    const isOverdue = agreement.next_payment_date && 
      new Date(agreement.next_payment_date) < new Date();

    return {
      icon: isOverdue ? 
        <BellRing className="h-4 w-4 text-red-500 animate-pulse" /> : 
        <CreditCard className="h-4 w-4 text-emerald-500" />,
      text: isOverdue ? "Payment Overdue" : "Next Payment",
      date: agreement.next_payment_date,
      amount: agreement.total_amount
    };
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const days = differenceInDays(new Date(endDate), new Date());
    return days > 0 ? days : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full sm:w-auto relative">
          <Input
            placeholder="Search agreements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending_payment">Pending Payment</SelectItem>
              <SelectItem value="pending_deposit">Pending Deposit</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Agreement Cards with Enhanced Design */}
      <div
        className={cn(
          "grid gap-4",
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        )}
      >
        {filteredAgreements.map((agreement) => {
          const statusConfig = getStatusConfig(agreement.status);
          const paymentInfo = getPaymentStatusInfo(agreement);
          const daysRemaining = agreement.end_date ? 
            getDaysRemaining(agreement.end_date) : null;

          return (
            <Card
              key={agreement.id}
              className={cn(
                "transition-all duration-200 hover:shadow-lg",
                "border-l-4",
                statusConfig.color
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <h3 className="font-semibold text-gray-900">
                        #{agreement.agreement_number}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      {agreement.agreement_type}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize flex items-center gap-1", 
                      statusConfig.color
                    )}
                  >
                    {statusConfig.icon}
                    <span>{statusConfig.text}</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Vehicle Information */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Car className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {agreement.vehicle?.make} {agreement.vehicle?.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      {agreement.vehicle?.license_plate}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {agreement.customer?.full_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Shield className="h-3.5 w-3.5" />
                      ID: {agreement.customer?.id}
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {paymentInfo.icon}
                  <div>
                    <p className="text-sm font-medium">{paymentInfo.text}</p>
                    {paymentInfo.date && (
                      <p className="text-xs text-gray-500">
                        {format(new Date(paymentInfo.date), "PPP")}
                      </p>
                    )}
                    {paymentInfo.amount && (
                      <p className="text-xs font-medium text-gray-700">
                        {formatCurrency(paymentInfo.amount)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timeline and Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(agreement.created_at), "PP")}
                    </span>
                    {daysRemaining !== null && (
                      <span className="flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        {daysRemaining} days remaining
                      </span>
                    )}
                  </div>
                  {agreement.end_date && (
                    <Progress 
                      value={
                        ((new Date().getTime() - new Date(agreement.created_at).getTime()) /
                        (new Date(agreement.end_date).getTime() - new Date(agreement.created_at).getTime())) * 100
                      } 
                      className="h-1.5"
                    />
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between gap-2 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
                
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(agreement)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View full agreement details</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onDelete(agreement)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete this agreement</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAgreements.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No agreements found
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating a new agreement"}
          </p>
        </div>
      )}
    </div>
  );
}
