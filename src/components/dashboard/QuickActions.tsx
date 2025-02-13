
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wrench, CreditCard, 
  FileText
} from "lucide-react";
import { CreateJobDialog } from "@/components/maintenance/CreateJobDialog";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const QuickActions = () => {
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);

  const actions = [
    {
      title: "Schedule Maintenance",
      icon: Wrench,
      onClick: () => setShowMaintenanceDialog(true),
      color: "text-orange-500"
    },
    {
      title: "Process Payment",
      icon: CreditCard,
      onClick: () => setShowPaymentDialog(true),
      color: "text-purple-500"
    },
    {
      title: "Generate Contract",
      icon: FileText,
      onClick: () => setShowContractDialog(true),
      color: "text-teal-500"
    }
  ];

  return (
    <>
      <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 group hover:bg-white/80"
                onClick={action.onClick}
              >
                <action.icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm text-center">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Dialog */}
      <CreateJobDialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog} />

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm />
        </DialogContent>
      </Dialog>

      {/* Contract Dialog */}
      <CreateAgreementDialog open={showContractDialog} onOpenChange={setShowContractDialog} />
    </>
  );
};
