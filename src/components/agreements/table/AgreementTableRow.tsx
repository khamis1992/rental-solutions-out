
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2, Info, Car, User, Truck, Calendar, Activity, CheckCircle, Clock, XCircle, CheckSquare } from "lucide-react";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AgreementEditor } from "../print/AgreementEditor";

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
  const [showTemplateDialog, setShowTemplateDialog] = React.useState(false);
  const [templateContent, setTemplateContent] = React.useState("");

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

  const handleViewTemplate = async () => {
    try {
      const { data: templateData, error } = await supabase
        .from("agreement_templates")
        .select("content")
        .eq("id", agreement.template_id)
        .single();

      if (error) throw error;

      if (!templateData?.content) {
        toast.error("No template content found");
        return;
      }

      let content = templateData.content
        .replace(/{{customer\.customer_name}}/g, agreement.customer?.full_name || "")
        .replace(/{{customer\.phone_number}}/g, agreement.customer?.phone_number || "")
        .replace(/{{vehicle\.make}}/g, agreement.vehicle?.make || "")
        .replace(/{{vehicle\.model}}/g, agreement.vehicle?.model || "")
        .replace(/{{vehicle\.year}}/g, agreement.vehicle?.year?.toString() || "")
        .replace(/{{vehicle\.license_plate}}/g, agreement.vehicle?.license_plate || "")
        .replace(/{{agreement\.agreement_number}}/g, agreement.agreement_number || "")
        .replace(/{{agreement\.start_date}}/g, formatDateToDisplay(agreement.start_date))
        .replace(/{{agreement\.end_date}}/g, formatDateToDisplay(agreement.end_date));

      setTemplateContent(content);
      setShowTemplateDialog(true);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
    }
  };

  const statusConfig = getStatusConfig(agreement.status);

  return (
    <TableRow className="group hover:bg-gray-50/80 transition-all duration-200">
      <TableCell>
        <button
          onClick={() => onNameClick(agreement.id)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group-hover:translate-x-1 transition-all duration-300"
        >
          <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
          {agreement.agreement_number}
        </button>
      </TableCell>
      <TableCell>
        <button
          onClick={() => onNameClick(agreement.id)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-all duration-300"
        >
          <Car className="h-4 w-4 group-hover:scale-110 transition-transform" />
          {agreement.vehicle?.license_plate}
        </button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
            <Truck className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{agreement.vehicle?.make}</span>
            <span className="text-sm text-gray-500">{agreement.vehicle?.model}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900 truncate max-w-[160px]">
            {agreement.customer?.full_name}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          {formatDateToDisplay(agreement.start_date)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          {formatDateToDisplay(agreement.end_date)}
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          className={`capitalize ${statusConfig.color} border px-3 py-1 transition-all duration-300 group-hover:scale-105 flex items-center gap-1.5 w-fit`}
        >
          {statusConfig.icon}
          {agreement.status}
        </Badge>
      </TableCell>
      
      <TableCell className="text-right space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewTemplate}
                className="hover:bg-blue-50 transition-colors duration-300"
              >
                <FileText className="h-4 w-4 text-blue-600 hover:text-blue-700 transition-colors duration-300" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Agreement Template</p>
            </TooltipContent>
          </Tooltip>

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

        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl">
            <AgreementEditor initialContent={templateContent} />
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
};
