
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleTablePagination } from "../vehicles/table/VehicleTablePagination";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";
import { useCustomers } from "./hooks/useCustomers";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { CustomerHeader } from "./CustomerHeader";
import { CustomerFilters } from "./CustomerFilters";
import { CustomerContent } from "./CustomerContent";

const ITEMS_PER_PAGE = 10;

export const CustomerList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");

  const { data, isLoading, error, refetch } = useCustomers({
    searchQuery,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE
  });

  const customers = data?.customers || [];
  const totalCount = data?.totalCount || 0;

  const filteredCustomers = customers.filter(customer => 
    roleFilter === "all" || customer.role === roleFilter
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleCustomerClick = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowDetailsDialog(true);
  };

  if (error) {
    return (
      <Card className="mx-auto">
        <CustomerHeader />
        <CardContent className="pt-0">
          <CustomerFilters 
            onSearchChange={setSearchQuery}
            onRoleFilter={setRoleFilter}
          />
          <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg mt-4">
            <p className="font-medium">Error loading customers</p>
            <p className="text-sm text-red-400">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mx-auto">
        <CustomerHeader />
        <CardContent className="pt-0">
          <CustomerFilters 
            onSearchChange={setSearchQuery}
            onRoleFilter={setRoleFilter}
          />
          <div className="mt-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredCustomers?.length) {
    return (
      <Card className="mx-auto">
        <CustomerHeader />
        <CardContent className="pt-0">
          <CustomerFilters 
            onSearchChange={setSearchQuery}
            onRoleFilter={setRoleFilter}
          />
          <div className="text-center py-12 bg-gray-50 rounded-lg mt-4">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-600">No customers found</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto">
      <CustomerHeader />
      <CardContent className="pt-0">
        <CustomerFilters 
          onSearchChange={setSearchQuery}
          onRoleFilter={setRoleFilter}
        />
        
        <div className="mt-4">
          <CustomerContent 
            customers={filteredCustomers}
            onCustomerClick={handleCustomerClick}
            onCustomerDeleted={refetch}
          />
        </div>

        <div className="flex justify-center mt-6">
          <VehicleTablePagination
            currentPage={currentPage + 1}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page - 1)}
          />
        </div>

        {selectedCustomerId && (
          <CustomerDetailsDialog
            customerId={selectedCustomerId}
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
          />
        )}
      </CardContent>
    </Card>
  );
};
