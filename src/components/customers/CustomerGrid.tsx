
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
import { useState, useRef, useEffect } from "react";

interface CustomerGridProps {
  customers: Customer[];
  onCustomerClick?: (customerId: string) => void;
}

export const CustomerGrid = ({ customers, onCustomerClick }: CustomerGridProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [swipedCustomerId, setSwipedCustomerId] = useState<string | null>(null);

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
      setSwipedCustomerId(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, customerId: string) => {
    e.stopPropagation();
    setSelectedCustomerId(customerId);
    setShowDeleteDialog(true);
  };

  const handleTouchStart = (e: React.TouchEvent, customerId: string) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent, customerId: string) => {
    if (!touchStart) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;

    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < -50) { // Left swipe
        setSwipedCustomerId(customerId);
      } else if (deltaX > 50) { // Right swipe
        setSwipedCustomerId(null);
      }
    }

    setTouchStart(null);
  };

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {customers.map((customer) => (
        <Card
          key={customer.id}
          className={cn(
            "relative flex flex-col min-h-[160px] cursor-pointer group",
            "hover:shadow-lg transition-all duration-300",
            "bg-card border-border/50 hover:border-border",
            "animate-fade-in touch-target overflow-hidden",
            swipedCustomerId === customer.id && "translate-x-[-80px]"
          )}
          onClick={() => !swipedCustomerId && onCustomerClick?.(customer.id)}
          onTouchStart={(e) => handleTouchStart(e, customer.id)}
          onTouchEnd={(e) => handleTouchEnd(e, customer.id)}
        >
          <div className="absolute right-0 top-0 bottom-0 w-[80px] bg-destructive flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleDeleteClick(e, customer.id)}
              className="h-full w-full rounded-none text-white hover:bg-destructive/90"
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </div>

          <div className="p-4 sm:p-6 flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg line-clamp-1">{customer.full_name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <Mail className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{customer.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-base">
                <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{customer.phone_number || "No phone number"}</span>
              </div>

              <div className="flex items-center gap-3 text-base">
                <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{customer.address || "No address"}</span>
              </div>

              <div className="flex items-center gap-3 text-base">
                <FileCheck className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{customer.driver_license || "No license"}</span>
              </div>
            </div>

            <div className="mt-auto pt-6 flex items-center justify-between">
              <Badge 
                variant="secondary"
                className={cn(
                  "flex items-center gap-1.5 text-sm py-1.5 px-3",
                  customer.driver_license ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
                )}
              >
                {customer.driver_license ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {customer.driver_license ? "Verified" : "Unverified"}
              </Badge>
              
              <Badge 
                variant="secondary" 
                className="bg-blue-500/15 text-blue-700 text-sm py-1.5 px-3"
              >
                {customer.role}
              </Badge>
            </div>
          </div>
        </Card>
      ))}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCustomerId && handleDelete(selectedCustomerId)}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
