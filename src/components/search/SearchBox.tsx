
import { useState, useCallback, useEffect } from "react";
import { Search, Keyboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  CommandDialog,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { VehicleDetailsDialog } from "@/components/vehicles/VehicleDetailsDialog";
import { CustomerDetailsDialog } from "@/components/customers/CustomerDetailsDialog";
import { AgreementDetailsDialog } from "@/components/agreements/AgreementDetailsDialog";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearch } from "@/components/search/useSearch";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

export const SearchBox = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const isMobile = useIsMobile();
  
  // Dialog states
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<string | null>(null);

  const { data: searchResults, error, isLoading } = useSearch(debouncedSearch);

  const handleSelect = useCallback((type: string, id: string) => {
    setOpen(false);
    switch (type) {
      case "vehicle":
        setSelectedVehicle(id);
        break;
      case "customer":
        setSelectedCustomer(id);
        break;
      case "agreement":
        setSelectedAgreement(id);
        break;
    }
  }, []);

  // Register keyboard shortcut
  useHotkeys('ctrl+k, cmd+k', (event) => {
    event.preventDefault();
    setOpen(true);
  });

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      // Wait a bit before clearing to avoid flickering during closing animation
      const timer = setTimeout(() => {
        setSearchQuery("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleOpenSearchDialog = () => {
    setOpen(true);
    toast.info("Pro tip: Press Ctrl+K to quickly search", {
      duration: 3000,
      position: "bottom-center",
    });
  };

  return (
    <>
      <div className="relative w-[200px]">
        <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={isMobile ? "Search..." : "Search..."}
          className="pl-8 h-8 text-sm"
          onClick={handleOpenSearchDialog}
        />
        <div className="absolute right-2 top-1.5">
          <Keyboard className="h-4 w-4 text-muted-foreground opacity-70" />
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className={cn("max-w-[90vw] md:max-w-[640px]")}>
          <CommandInput 
            placeholder="Type to search vehicles, customers, agreements..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-10 md:h-12"
            autoFocus
          />
          <CommandList className="max-h-[50vh] md:max-h-[400px] overflow-auto">
            <SearchResults
              isLoading={isLoading}
              error={error}
              searchQuery={searchQuery}
              searchResults={searchResults}
              handleSelect={handleSelect}
            />
          </CommandList>
        </div>
      </CommandDialog>

      {selectedVehicle && (
        <VehicleDetailsDialog
          vehicleId={selectedVehicle}
          open={!!selectedVehicle}
          onOpenChange={(open) => !open && setSelectedVehicle(null)}
        />
      )}
      
      {selectedCustomer && (
        <CustomerDetailsDialog
          customerId={selectedCustomer}
          open={!!selectedCustomer}
          onOpenChange={(open) => !open && setSelectedCustomer(null)}
        />
      )}
      
      {selectedAgreement && (
        <AgreementDetailsDialog
          agreementId={selectedAgreement}
          open={!!selectedAgreement}
          onOpenChange={(open) => !open && setSelectedAgreement(null)}
        />
      )}
    </>
  );
};
