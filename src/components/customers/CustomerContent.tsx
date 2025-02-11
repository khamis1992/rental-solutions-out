
import { Table, TableBody } from "@/components/ui/table";
import { CustomerTableHeader } from "./table/CustomerTableHeader";
import { CustomerTableRow } from "./table/CustomerTableRow";
import { CustomerGrid } from "./CustomerGrid";
import type { Customer } from "./types/customer";
import { ViewSwitcher } from "./ViewSwitcher";
import { useState, useEffect } from "react";

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
  const [view, setView] = useState<"grid" | "table">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(VIEW_STORAGE_KEY) as "grid" | "table") || "table";
    }
    return "table";
  });

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  if (view === "grid") {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <ViewSwitcher view={view} onViewChange={setView} />
        </div>
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
      <div className="rounded-md border bg-card overflow-hidden">
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
