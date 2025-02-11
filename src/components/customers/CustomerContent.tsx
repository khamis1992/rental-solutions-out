
import { Table, TableBody } from "@/components/ui/table";
import { CustomerTableHeader } from "./table/CustomerTableHeader";
import { CustomerTableRow } from "./table/CustomerTableRow";
import { CustomerGrid } from "./CustomerGrid";
import type { Customer } from "./types/customer";
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomerContentProps {
  customers: Customer[];
  onCustomerClick: (customerId: string) => void;
  onCustomerDeleted: () => void;
}

export const CustomerContent = ({ 
  customers, 
  onCustomerClick,
  onCustomerDeleted 
}: CustomerContentProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <CustomerGrid 
        customers={customers}
        onCustomerClick={onCustomerClick}
      />
    );
  }

  return (
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
  );
};
