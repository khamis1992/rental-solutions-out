
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { VehicleTablePagination } from "../../vehicles/table/VehicleTablePagination";
import type { Agreement } from "../hooks/useAgreements";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Info, Car, User, Calendar, Activity, CheckCircle, Clock, XCircle, CheckSquare } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteAgreementDialog } from "../DeleteAgreementDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AgreementEditor } from "../print/AgreementEditor";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgreementListContentProps {
  agreements: Agreement[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewContract: (id: string) => void;
  onPrintContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
  onNameClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
  onDeleted: () => void;
}

export const AgreementListContent = ({
  agreements,
  currentPage,
  totalPages,
  onPageChange,
  onViewContract,
  onPrintContract,
  onAgreementClick,
  onNameClick,
  onDeleteClick,
  onDeleted,
}: AgreementListContentProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateContent, setTemplateContent] = useState("");
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);

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

  const handleViewTemplate = async (agreementId: string) => {
    try {
      const { data: agreement } = await supabase
        .from("leases")
        .select("template_id")
        .eq("id", agreementId)
        .single();

      if (!agreement?.template_id) {
        toast.error("No template found for this agreement");
        return;
      }

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

      setTemplateContent(templateData.content);
      setShowTemplateDialog(true);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agreements.map((agreement) => {
          const statusConfig = getStatusConfig(agreement.status);
          
          return (
            <Card key={agreement.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onNameClick(agreement.id)}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{agreement.agreement_number}</span>
                  </button>
                  <Badge 
                    variant="outline" 
                    className={`capitalize ${statusConfig.color} border px-2 py-0.5 transition-all duration-300 flex items-center gap-1 w-fit`}
                  >
                    {statusConfig.icon}
                    <span className="truncate">{agreement.status}</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-full">
                    <Car className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {agreement.vehicle?.make} {agreement.vehicle?.model}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {agreement.vehicle?.license_plate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {agreement.customer?.full_name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="truncate">{formatDateToDisplay(agreement.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="truncate">{formatDateToDisplay(agreement.end_date)}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 flex justify-end gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTemplate(agreement.id)}
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
                        onClick={() => setShowDeleteDialog(agreement.id)}
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
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <VehicleTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {showDeleteDialog && (
        <DeleteAgreementDialog
          agreementId={showDeleteDialog}
          open={!!showDeleteDialog}
          onOpenChange={(open) => !open && setShowDeleteDialog(null)}
          onDeleted={onDeleted}
        />
      )}

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl">
          <AgreementEditor initialContent={templateContent} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

