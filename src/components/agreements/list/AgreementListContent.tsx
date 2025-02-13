
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { VehicleTablePagination } from "../../vehicles/table/VehicleTablePagination";
import type { Agreement } from "../hooks/useAgreements";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Trash2, 
  Info, 
  Car, 
  User, 
  Calendar, 
  Activity, 
  CheckCircle, 
  Clock, 
  XCircle, 
  CheckSquare,
  CircleDot,
  MapPin
} from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";

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

  const getStatusConfig = (status: string): { color: string; icon: React.ReactNode; bgColor: string } => {
    switch (status) {
      case 'active':
        return {
          color: 'text-emerald-700 dark:text-emerald-400',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          icon: <CheckCircle className="h-3.5 w-3.5 animate-pulse" />
        };
      case 'pending_payment':
        return {
          color: 'text-amber-700 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          icon: <Clock className="h-3.5 w-3.5" />
        };
      case 'terminated':
        return {
          color: 'text-red-700 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          icon: <XCircle className="h-3.5 w-3.5" />
        };
      case 'completed':
        return {
          color: 'text-blue-700 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          icon: <CheckSquare className="h-3.5 w-3.5" />
        };
      default:
        return {
          color: 'text-gray-700 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agreements.map((agreement) => {
          const statusConfig = getStatusConfig(agreement.status);
          
          return (
            <Card 
              key={agreement.id} 
              className="group hover:shadow-lg transition-all duration-300 border-l-4 dark:bg-gray-800/50 backdrop-blur-sm"
              style={{ 
                borderLeftColor: agreement.status === 'active' ? '#10B981' 
                  : agreement.status === 'pending_payment' ? '#F59E0B'
                  : agreement.status === 'terminated' ? '#EF4444'
                  : agreement.status === 'completed' ? '#3B82F6'
                  : '#6B7280'
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onNameClick(agreement.id)}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium transition-colors group/button"
                  >
                    <div className="p-1.5 bg-blue-50 rounded-lg group-hover/button:bg-blue-100 transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span>{agreement.agreement_number}</span>
                  </button>
                  <Badge 
                    variant="outline" 
                    className={`capitalize ${statusConfig.color} ${statusConfig.bgColor} border-0 px-2 py-0.5 transition-all duration-300 flex items-center gap-1.5 w-fit font-medium`}
                  >
                    {statusConfig.icon}
                    <span>{agreement.status}</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {agreement.vehicle?.make} {agreement.vehicle?.model}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{agreement.vehicle?.license_plate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {agreement.customer?.full_name}
                    </p>
                    {agreement.rent_amount > 0 && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <CircleDot className="h-3.5 w-3.5" />
                        <span>{formatCurrency(agreement.rent_amount)}/month</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Start Date</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatDateToDisplay(agreement.start_date)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>End Date</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatDateToDisplay(agreement.end_date)}
                    </p>
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
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
                      >
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
                      >
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                        className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300"
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
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
