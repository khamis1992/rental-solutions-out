
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { useState } from "react";
import { CustomerDetailsDialog } from "@/components/customers/CustomerDetailsDialog";
import { AgreementDetailsDialog } from "@/components/agreements/AgreementDetailsDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface VehicleTimelineProps {
  vehicleId: string;
}

type TimelineEvent = {
  id: string;
  type: 'maintenance' | 'rental' | 'damage';
  date: string;
  status?: string;
  service_type?: string;
  description?: string;
  customer_id?: string;
  profiles?: {
    id: string;
    full_name: string;
  };
  agreement_number?: string;
};

export const VehicleTimeline = ({
  vehicleId
}: VehicleTimelineProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  
  const {
    data: events = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["vehicle-timeline", vehicleId],
    queryFn: async () => {
      try {
        // Fetch maintenance records with proper qualification for vehicle_id
        const {
          data: maintenance,
          error: maintenanceError
        } = await supabase
          .from("maintenance")
          .select("id, service_type, scheduled_date, status, description")
          .eq("vehicle_id", vehicleId)
          .order("scheduled_date", { ascending: false });
          
        if (maintenanceError) {
          console.error("Error fetching maintenance records:", maintenanceError);
          throw maintenanceError;
        }

        // Fetch rental records (leases) with proper qualification for vehicle_id
        const {
          data: rentals,
          error: rentalsError
        } = await supabase
          .from("leases")
          .select(`
            id, 
            customer_id, 
            agreement_number, 
            start_date, 
            status,
            profiles:customer_id (
              id,
              full_name
            )
          `)
          .eq("vehicle_id", vehicleId)
          .order("start_date", { ascending: false });
          
        if (rentalsError) {
          console.error("Error fetching rental records:", rentalsError);
          throw rentalsError;
        }

        // Fetch damage records with proper qualification for vehicle_id
        const {
          data: damages,
          error: damagesError
        } = await supabase
          .from("damages")
          .select("id, description, reported_date, source")
          .eq("vehicle_id", vehicleId)
          .order("reported_date", { ascending: false });
          
        if (damagesError) {
          console.error("Error fetching damage records:", damagesError);
          throw damagesError;
        }

        // Combine and format all events
        const allEvents: TimelineEvent[] = [
          ...(maintenance?.map(m => ({
            id: m.id,
            type: 'maintenance' as const,
            date: m.scheduled_date,
            status: m.status,
            service_type: m.service_type,
            description: m.description
          })) || []),
          ...(rentals?.map(r => ({
            id: r.id,
            type: 'rental' as const,
            date: r.start_date,
            status: r.status,
            customer_id: r.customer_id,
            profiles: r.profiles,
            agreement_number: r.agreement_number
          })) || []),
          ...(damages?.map(d => ({
            id: d.id,
            type: 'damage' as const,
            date: d.reported_date,
            description: d.description,
            source: d.source
          })) || [])
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return allEvents;
      } catch (error) {
        console.error("Timeline query error:", error);
        throw error;
      }
    }
  });

  // Handle errors in the query
  if (error) {
    console.error("Timeline error:", error);
    toast.error("Failed to load vehicle timeline");
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Vehicle Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-red-500">
            Error loading timeline data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Vehicle Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-4 border-l-2 pl-4 border-neutral-200">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-400">Maintenance</Badge>;
      case 'rental':
        return <Badge className="bg-primary hover:bg-primary/90">Rental</Badge>;
      case 'damage':
        return <Badge variant="destructive">Damage</Badge>;
      default:
        return null;
    }
  };
  
  const getEventDescription = (event: TimelineEvent) => {
    switch (event.type) {
      case 'maintenance':
        return (
          <div className="flex items-center gap-2">
            <span>{event.service_type}</span>
            <Badge variant="outline" className="bg-green-400 hover:bg-green-300">
              {event.status}
            </Badge>
          </div>
        );
      case 'rental':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span>Rented to </span>
            {event.profiles?.full_name ? (
              <button 
                onClick={() => setSelectedCustomerId(event.customer_id || null)} 
                className="text-primary hover:underline font-medium"
              >
                {event.profiles.full_name}
              </button>
            ) : (
              <span className="italic text-muted-foreground">Unknown Customer</span>
            )}
            <span className="text-muted-foreground mx-1">•</span>
            <button 
              onClick={() => setSelectedAgreementId(event.id)} 
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Link className="h-4 w-4" />
              <span>Agreement #{event.agreement_number}</span>
            </button>
            <span className="text-muted-foreground mx-1">•</span>
            <Badge 
              variant={event.status === 'active' ? 'default' : 'outline'} 
              className="bg-rose-600 hover:bg-rose-500"
            >
              {event.status}
            </Badge>
          </div>
        );
      case 'damage':
        return event.description;
      default:
        return '';
    }
  };

  // No events found
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Vehicle Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No timeline events found for this vehicle
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Vehicle Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map(event => (
            <div 
              key={`${event.type}-${event.id}`} 
              className={`flex items-start gap-4 border-l-2 pl-4 ${
                event.type === 'rental' && event.status === 'closed' 
                  ? 'border-neutral-200' 
                  : event.type === 'rental' 
                    ? 'border-primary' 
                    : 'border-muted'
              }`}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEventBadge(event.type)}
                    <div className="text-sm font-medium">{getEventDescription(event)}</div>
                  </div>
                  <time className="text-sm text-muted-foreground">
                    {formatDateToDisplay(new Date(event.date))}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer and Agreement Detail Dialogs */}
        {selectedCustomerId && (
          <CustomerDetailsDialog 
            customerId={selectedCustomerId} 
            open={!!selectedCustomerId} 
            onOpenChange={open => !open && setSelectedCustomerId(null)} 
          />
        )}

        {selectedAgreementId && (
          <AgreementDetailsDialog 
            agreementId={selectedAgreementId} 
            open={!!selectedAgreementId} 
            onOpenChange={open => !open && setSelectedAgreementId(null)} 
          />
        )}
      </CardContent>
    </Card>
  );
};
