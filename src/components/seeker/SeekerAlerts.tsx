
import { useSeekerTargets } from '@/hooks/use-seeker-targets';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Bell, Check } from 'lucide-react';

export function SeekerAlerts() {
  const { alerts } = useSeekerTargets();

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p>No alerts to display</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert.id} className={`p-4 ${!alert.is_read ? 'bg-muted/50' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-full ${getSeverityColor(alert.alert_severity)} text-white`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{alert.message}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                </div>
                {alert.location_lat && alert.location_lng && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Location: {alert.location_lat.toFixed(6)}, {alert.location_lng.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
            {!alert.is_read && (
              <Button variant="ghost" size="sm">
                <Check className="w-4 h-4 mr-2" />
                Mark as Read
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
