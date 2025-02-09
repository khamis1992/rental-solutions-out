
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  UserCircle, 
  ExternalLink,
  Phone,
  MapPin,
  FileCheck,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { Customer } from "../types/customer";
import { Badge } from "@/components/ui/badge";

interface CustomerTableRowProps {
  customer: Customer;
  onDeleted: () => void;
  onClick?: () => void;
}

export const CustomerTableRow = ({ customer, onDeleted, onClick }: CustomerTableRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customer.id);

      if (error) throw error;

      toast.success("Customer deleted successfully");
      onDeleted();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.message || "Failed to delete customer");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <>
      <TableRow 
        className="hover:bg-muted/50 cursor-pointer transition-all duration-200 group"
        onClick={onClick}
      >
        <TableCell className="py-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                  <UserCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{customer.full_name}</div>
                  <div className="text-xs text-muted-foreground">{customer.email}</div>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{customer.full_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Customer since {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </TableCell>

        <TableCell className="py-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(customer.phone_number || '');
                  }}
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{customer.phone_number}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to copy phone number</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>

        <TableCell className="py-3 max-w-[200px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{customer.address}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{customer.address}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>

        <TableCell className="py-3">
          <div className="flex items-center gap-2">
            {customer.driver_license ? (
              <FileCheck className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-sm">{customer.driver_license || 'Not provided'}</span>
          </div>
        </TableCell>

        <TableCell className="py-3">
          <div className="flex gap-1.5">
            {customer.id_document_url && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 transition-all hover:bg-blue-100">
                <FileCheck className="w-3 h-3 mr-1" />
                ID
              </Badge>
            )}
            {customer.license_document_url && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 transition-all hover:bg-green-100">
                <FileCheck className="w-3 h-3 mr-1" />
                License
              </Badge>
            )}
          </div>
        </TableCell>

        <TableCell className="py-3">
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
