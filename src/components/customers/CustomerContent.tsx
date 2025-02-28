
import { Table, TableBody } from "@/components/ui/table";
import { CustomerTableHeader } from "./table/CustomerTableHeader";
import { CustomerTableRow } from "./table/CustomerTableRow";
import { CustomerGrid } from "./CustomerGrid";
import type { Customer } from "./types/customer";
import { ViewSwitcher } from "./ViewSwitcher";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomerContentProps {
  customers: Customer[];
  onCustomerClick: (customerId: string) => void;
  onCustomerDeleted: () => void;
}

const VIEW_STORAGE_KEY = "customer-view-preference";

export const CustomerContent = ({ 
  customers, 
  onCustomerClick,
  onCustomerDeleted 
}: CustomerContentProps) => {
  const isMobile = useIsMobile();
  const [view, setView] = useState<"grid" | "table">(() => {
    // Default to grid on mobile, otherwise use stored preference
    if (typeof window !== "undefined") {
      return isMobile 
        ? "grid" 
        : (localStorage.getItem(VIEW_STORAGE_KEY) as "grid" | "table") || "grid";
    }
    return "grid";
  });

  // Update view when mobile status changes
  useEffect(() => {
    if (isMobile && view === "table") {
      setView("grid");
    }
  }, [isMobile, view]);

  useEffect(() => {
    if (!isMobile) {  // Only store preference on non-mobile
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    }
  }, [view, isMobile]);

  // Force grid view on mobile
  const effectiveView = isMobile ? "grid" : view;

  if (effectiveView === "grid") {
    return (
      <div className="space-y-6">
        {!isMobile && (
          <div className="flex justify-end">
            <ViewSwitcher view={view} onViewChange={setView} />
          </div>
        )}
        <CustomerGrid 
          customers={customers}
          onCustomerClick={onCustomerClick}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ViewSwitcher view={view} onViewChange={setView} />
      </div>
      <div className="rounded-md border bg-card overflow-hidden overflow-x-auto">
        <Table>
          <CustomerTableHeader />
          <TableBody>
            {customers.map((customer) => (
              <CustomerTableRow
                key={customer.id}
                customer={customer}
                onDeleted={onCustomerDeleted}
                onClick={() => onCustomerClick(customer.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
