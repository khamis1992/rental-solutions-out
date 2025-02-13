
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImportExportCustomers } from "./ImportExportCustomers";
import { ReactNode } from "react";

interface ImportCustomerDialogProps {
  children: ReactNode;
}

export const ImportCustomerDialog = ({ children }: ImportCustomerDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Customers</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing customer data. The file should include headers for customer details.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ImportExportCustomers />
        </div>
      </DialogContent>
    </Dialog>
  );
};
