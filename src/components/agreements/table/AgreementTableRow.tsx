
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import type { Agreement } from "@/types/agreement.types";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DeleteAgreementDialog } from "../DeleteAgreementDialog";

interface AgreementTableRowProps {
  agreement: Agreement;
  onViewContract: (id: string) => void;
  onPrintContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
  onNameClick: (id: string) => void;
  onDeleted: () => void;
  onDeleteClick: () => void;
}

export const AgreementTableRow = ({
  agreement,
  onAgreementClick,
  onNameClick,
  onDeleted,
}: AgreementTableRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const getStatusConfig = (status: string): { color: string; } => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-400'
        };
      case 'pending_payment':
        return {
          color: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-400'
        };
      case 'terminated':
        return {
          color: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-400'
        };
      case 'completed':
        return {
          color: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-400'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-400'
        };
    }
  };

  const statusConfig = getStatusConfig(agreement.status);

  return (
    <TableRow className="group hover:bg-gray-50/80 transition-all duration-200">
      <TableCell className="py-2">
        <button
          onClick={() => onNameClick(agreement.id)}
          className="text-blue-600 hover:text-blue-700 font-medium group-hover:translate-x-1 transition-all duration-300"
        >
          <span className="truncate">{agreement.agreement_number}</span>
        </button>
      </TableCell>
      <TableCell className="py-2">
        <button
          onClick={() => onNameClick(agreement.id)}
          className="text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-all duration-300"
        >
          <span className="truncate">{agreement.vehicle?.license_plate}</span>
        </button>
      </TableCell>
      <TableCell className="py-2">
        <span className="font-medium text-gray-900 truncate max-w-[130px]">
          {agreement.customer?.full_name}
        </span>
      </TableCell>
      <TableCell className="py-2">
        <span className="text-gray-600 truncate">{formatDateToDisplay(agreement.start_date)}</span>
      </TableCell>
      <TableCell className="py-2">
        <span className="text-gray-600 truncate">{formatDateToDisplay(agreement.end_date)}</span>
      </TableCell>
      <TableCell className="py-2">
        <Badge 
          variant="outline" 
          className={`capitalize ${statusConfig.color} border px-2 py-0.5 transition-all duration-300 group-hover:scale-105 flex items-center gap-1 w-fit`}
        >
          <span className="truncate">{agreement.status}</span>
        </Badge>
      </TableCell>
      <TableCell className="py-2 text-right">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="hover:bg-red-50 transition-colors duration-300"
              >
                <Trash2 className="h-4 w-4 text-red-600 hover:text-red-500 transition-colors duration-300" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Agreement</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DeleteAgreementDialog
          agreementId={agreement.id}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onDeleted={onDeleted}
        />
      </TableCell>
    </TableRow>
  );
};
