
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Phone,
  MapPin,
  FileCheck,
  Trash2,
  User,
  CheckCircle2,
  AlertCircle,
  Mail,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Customer } from "./types/customer";
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
import { useState } from "react";

interface CustomerGridProps {
  customers: Customer[];
  onCustomerClick?: (customerId: string) => void;
}

export const CustomerGrid = ({ customers, onCustomerClick }: CustomerGridProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (customerId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
      toast.success("Customer deleted successfully");
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.message || "Failed to delete customer");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, customerId: string) => {
    e.stopPropagation();
    setSelectedCustomerId(customerId);
    setShowDeleteDialog(true);
  };

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => (
        <Card
          key={customer.id}
          className={cn(
            "flex flex-col h-[220px] cursor-pointer group",
            "hover:shadow-lg transition-all duration-300",
            "bg-card border-border/50 hover:border-border",
            "animate-fade-in touch-target"
          )}
          onClick={() => onCustomerClick?.(customer.id)}
        >
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium line-clamp-1">{customer.full_name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDeleteClick(e, customer.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 p-0 touch-target"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{customer.phone_number || "No phone number"}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{customer.address || "No address"}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <FileCheck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{customer.driver_license || "No license"}</span>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
              <Badge 
                variant="secondary"
                className={cn(
                  "flex items-center gap-1.5",
                  customer.driver_license ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
                )}
              >
                {customer.driver_license ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                {customer.driver_license ? "Verified" : "Unverified"}
              </Badge>
              
              <Badge 
                variant="secondary" 
                className="bg-blue-500/15 text-blue-700"
              >
                {customer.role}
              </Badge>
            </div>
          </div>
        </Card>
      ))}

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
              onClick={() => selectedCustomerId && handleDelete(selectedCustomerId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
