
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, FileText, 
  CreditCard, Wrench, 
  CalendarClock, Settings, 
  Car, BarChart
} from "lucide-react";
import { CreateJobDialog } from "@/components/maintenance/CreateJobDialog";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const QuickActions = () => {
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string>(""); // Added for payment form

  const actions = [
    {
      title: "Add Customer",
      description: "Register a new customer",
      icon: UserPlus,
      onClick: () => setShowCustomerDialog(true),
      color: "text-pink-500 bg-pink-100/50",
      hoverColor: "hover:bg-pink-100"
    },
    {
      title: "New Contract",
      description: "Create a rental agreement",
      icon: FileText,
      onClick: () => setShowContractDialog(true),
      color: "text-teal-500 bg-teal-100/50",
      hoverColor: "hover:bg-teal-100"
    },
    {
      title: "Process Payment",
      description: "Record a new payment",
      icon: CreditCard,
      onClick: () => setShowPaymentDialog(true),
      color: "text-purple-500 bg-purple-100/50",
      hoverColor: "hover:bg-purple-100"
    },
    {
      title: "Schedule Maintenance",
      description: "Create a service request",
      icon: Wrench,
      onClick: () => setShowMaintenanceDialog(true),
      color: "text-orange-500 bg-orange-100/50",
      hoverColor: "hover:bg-orange-100"
    },
    {
      title: "Schedule Test Drive",
      description: "Set up a customer test drive",
      icon: CalendarClock,
      onClick: () => navigate('/schedule'),
      color: "text-blue-500 bg-blue-100/50",
      hoverColor: "hover:bg-blue-100"
    },
    {
      title: "Add Vehicle",
      description: "Register a new vehicle",
      icon: Car,
      onClick: () => navigate('/vehicles/new'),
      color: "text-emerald-500 bg-emerald-100/50",
      hoverColor: "hover:bg-emerald-100"
    },
    {
      title: "View Reports",
      description: "Access business analytics",
      icon: BarChart,
      onClick: () => navigate('/reports'),
      color: "text-indigo-500 bg-indigo-100/50",
      hoverColor: "hover:bg-indigo-100"
    },
    {
      title: "System Settings",
      description: "Configure system preferences",
      icon: Settings,
      onClick: () => navigate('/settings'),
      color: "text-gray-500 bg-gray-100/50",
      hoverColor: "hover:bg-gray-100"
    }
  ];

  const navigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <>
      <Card className="bg-white/60 backdrop-blur-sm hover:bg-white/70 transition-colors shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-blue-500 rounded-full"></span>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-auto flex flex-col items-center justify-center gap-2 group p-4 text-center border-gray-200 transition-all duration-200 ${action.hoverColor} hover:border-gray-300 hover:shadow-md`}
                onClick={action.onClick}
              >
                <div className={`p-2 rounded-full ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className={`h-5 w-5`} />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">{action.title}</span>
                  <p className="text-xs text-muted-foreground leading-tight">{action.description}</p>
                </div>
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
          <PaymentForm agreementId={selectedAgreementId} />
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <CreateCustomerDialog 
        open={showCustomerDialog} 
        onOpenChange={setShowCustomerDialog}
      >
        <div className="hidden">Trigger</div>
      </CreateCustomerDialog>

      {/* Contract Dialog */}
      <CreateAgreementDialog 
        open={showContractDialog} 
        onOpenChange={setShowContractDialog}
      >
        <div className="hidden">Trigger</div>
      </CreateAgreementDialog>
    </>
  );
};
