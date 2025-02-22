
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Info, Trash2, Car, User, Truck, Calendar, Activity, CheckCircle, Clock, XCircle, CheckSquare } from "lucide-react";
import type { Agreement } from "@/types/agreement.types";
import { supabase } from "@/integrations/supabase/client";
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
  onDeleteClick,
}: AgreementTableRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const getStatusConfig = (status: string): { color: string; icon: React.ReactNode } => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-400',
          icon: <CheckCircle className="h-3.5 w-3.5 animate-pulse" />
        };
      case 'pending_payment':
        return {
          color: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-400',
          icon: <Clock className="h-3.5 w-3.5" />
        };
      case 'terminated':
        return {
          color: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-400',
          icon: <XCircle className="h-3.5 w-3.5" />
        };
      case 'completed':
        return {
          color: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-400',
          icon: <CheckSquare className="h-3.5 w-3.5" />
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-400',
          icon: <Activity className="h-3.5 w-3.5" />
        };
    }
  };

  const statusConfig = getStatusConfig(agreement.status);

  return (
    <TableRow className="group hover:bg-gray-50/80 transition-all duration-200">
      <TableCell className="py-2">
        <button
          onClick={() => onNameClick(agreement.id)}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium group-hover:translate-x-1 transition-all duration-300"
        >
          <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span className="truncate">{agreement.agreement_number}</span>
        </button>
      </TableCell>
      <TableCell className="py-2">
        <button
          onClick={() => onNameClick(agreement.id)}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-all duration-300"
        >
          <Car className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span className="truncate">{agreement.vehicle?.license_plate}</span>
        </button>
      </TableCell>
      <TableCell className="py-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
            <Truck className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 truncate">{agreement.vehicle?.make}</span>
            <span className="text-sm text-gray-500 truncate">{agreement.vehicle?.model}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-2">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 h-7 w-7 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900 truncate max-w-[130px]">
            {agreement.customer?.full_name}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-2">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="truncate">{formatDateToDisplay(agreement.start_date)}</span>
        </div>
      </TableCell>
      <TableCell className="py-2">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="truncate">{formatDateToDisplay(agreement.end_date)}</span>
        </div>
      </TableCell>
      <TableCell className="py-2">
        <Badge 
          variant="outline" 
          className={`capitalize ${statusConfig.color} border px-2 py-0.5 transition-all duration-300 group-hover:scale-105 flex items-center gap-1 w-fit`}
        >
          {statusConfig.icon}
          <span className="truncate">{agreement.status}</span>
        </Badge>
      </TableCell>
      <TableCell className="py-2 text-right space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNameClick(agreement.id)}
                className="hover:bg-blue-50 transition-colors duration-300"
              >
                <Info className="h-4 w-4 text-blue-600 hover:text-blue-700 transition-colors duration-300" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Agreement Details</p>
            </TooltipContent>
          </Tooltip>

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
