
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Key, Wrench, CreditCard, 
  UserPlus, Calendar, FileText, Clock
} from "lucide-react";
import { toast } from "sonner";

const actions = [
  {
    title: "Check-out Vehicle",
    icon: Key,
    onClick: () => toast.info("Vehicle check-out feature coming soon"),
    color: "text-green-500"
  },
  {
    title: "Schedule Maintenance",
    icon: Wrench,
    onClick: () => toast.info("Maintenance scheduling feature coming soon"),
    color: "text-orange-500"
  },
  {
    title: "Process Payment",
    icon: CreditCard,
    onClick: () => toast.info("Payment processing feature coming soon"),
    color: "text-purple-500"
  },
  {
    title: "Add Customer",
    icon: UserPlus,
    onClick: () => toast.info("Add customer feature coming soon"),
    color: "text-pink-500"
  },
  {
    title: "Book Appointment",
    icon: Calendar,
    onClick: () => toast.info("Appointment booking feature coming soon"),
    color: "text-indigo-500"
  },
  {
    title: "Generate Contract",
    icon: FileText,
    onClick: () => toast.info("Contract generation feature coming soon"),
    color: "text-teal-500"
  },
  {
    title: "View Schedule",
    icon: Clock,
    onClick: () => toast.info("Schedule view feature coming soon"),
    color: "text-rose-500"
  }
];

export const QuickActions = () => {
  return (
    <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
  );
};
