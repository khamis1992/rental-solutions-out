
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Calendar, Car, CreditCard, Smartphone, User } from "lucide-react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface SearchResult {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  color?: string;
  vin?: string;
  status?: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  profile_completion_score?: number;
  agreement_number?: string;
  start_date?: string;
  end_date?: string;
  total_amount?: number;
  customer_id?: string;
  vehicles?: {
    make: string;
    model: string;
    license_plate: string;
  };
  profiles?: {
    full_name: string;
  };
}

interface SearchResultsProps {
  isLoading: boolean;
  error: unknown;
  searchQuery: string;
  searchResults: {
    vehicles: SearchResult[];
    customers: SearchResult[];
    agreements: SearchResult[];
  } | undefined;
  handleSelect: (type: string, id: string) => void;
}

export const SearchResults = ({
  isLoading,
  error,
  searchQuery,
  searchResults,
  handleSelect,
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <CommandEmpty>Error loading results. Please try again.</CommandEmpty>;
  }

  if (!searchQuery) {
    return <CommandEmpty>Start typing to search...</CommandEmpty>;
  }

  if (searchQuery.length < 2) {
    return <CommandEmpty>Please enter at least 2 characters...</CommandEmpty>;
  }

  if (
    !searchResults?.vehicles.length &&
    !searchResults?.customers.length &&
    !searchResults?.agreements.length
  ) {
    return <CommandEmpty>No results found.</CommandEmpty>;
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'rented':
      case 'pending':
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'maintenance':
      case 'overdue':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'unavailable':
      case 'cancelled':
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  return (
    <>
      {searchResults?.vehicles.length > 0 && (
        <CommandGroup heading="Vehicles">
          {searchResults.vehicles.map((vehicle) => (
            <CommandItem
              key={vehicle.id}
              onSelect={() => handleSelect("vehicle", vehicle.id)}
              className="flex items-start justify-between p-2"
            >
              <div className="flex items-start gap-2">
                <Car className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {vehicle.license_plate} {vehicle.color && `• ${vehicle.color}`}
                  </div>
                  {vehicle.vin && (
                    <div className="text-xs text-muted-foreground">
                      VIN: {vehicle.vin}
                    </div>
                  )}
                </div>
              </div>
              {vehicle.status && (
                <Badge className={`ml-2 ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </Badge>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {searchResults?.customers.length > 0 && (
        <CommandGroup heading="Customers">
          {searchResults.customers.map((customer) => (
            <CommandItem
              key={customer.id}
              onSelect={() => handleSelect("customer", customer.id)}
              className="flex items-start justify-between p-2"
            >
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="font-medium">{customer.full_name}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {customer.phone_number && (
                      <div className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        <span>{customer.phone_number}</span>
                      </div>
                    )}
                  </div>
                  {customer.email && (
                    <div className="text-xs text-muted-foreground">
                      {customer.email}
                    </div>
                  )}
                </div>
              </div>
              {customer.status && (
                <Badge className={`ml-2 ${getStatusColor(customer.status)}`}>
                  {customer.status}
                </Badge>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {searchResults?.agreements.length > 0 && (
        <CommandGroup heading="Agreements">
          {searchResults.agreements.map((agreement) => (
            <CommandItem
              key={agreement.id}
              onSelect={() => handleSelect("agreement", agreement.id)}
              className="flex items-start justify-between p-2"
            >
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    Agreement #{agreement.agreement_number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {agreement.vehicles?.make} {agreement.vehicles?.model} • 
                    {agreement.profiles?.full_name || 'Customer'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {agreement.start_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(agreement.start_date), 'MMM d, yyyy')}
                          {agreement.end_date && 
                            ` - ${format(new Date(agreement.end_date), 'MMM d, yyyy')}`}
                        </span>
                      </div>
                    )}
                    {agreement.total_amount && (
                      <div className="font-semibold">
                        {formatCurrency(agreement.total_amount)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {agreement.status && (
                <Badge className={`ml-2 ${getStatusColor(agreement.status)}`}>
                  {agreement.status}
                </Badge>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
};
