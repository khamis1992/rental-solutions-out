
import { Badge } from "@/components/ui/badge";

interface TrafficFineStatusBadgeProps {
  status: string;
}

export const TrafficFineStatusBadge = ({ status }: TrafficFineStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'badge-success';
      case 'failed':
        return 'badge-danger';
      case 'refunded':
        return 'badge-info';
      case 'pending':
      default:
        return 'badge-warning';
    }
  };

  return (
    <Badge 
      variant="secondary"
      className={getStatusColor(status)}
    >
      {status}
    </Badge>
  );
};
