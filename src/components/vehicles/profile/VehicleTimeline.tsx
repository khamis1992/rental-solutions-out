
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
  customer_name?: string;
  agreement_number?: string;
  source?: string;
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
      let allEvents: TimelineEvent[] = [];
      
      console.log("Fetching timeline data for vehicle ID:", vehicleId);
      
      // Fetch maintenance records - in separate try/catch for independence
      try {
        const { data: maintenance, error: maintenanceError } = await supabase
          .from("maintenance")
          .select(`
            id,
            service_type,
            scheduled_date,
            status,
            description
          `)
          .eq("vehicle_id", vehicleId)
          .order("scheduled_date", { ascending: false });
            
        if (maintenanceError) {
          console.error("Error fetching maintenance records:", maintenanceError);
        } else {
          console.log("Maintenance records fetched:", maintenance?.length || 0);

          // Add maintenance events to the timeline
          if (maintenance && maintenance.length > 0) {
            const maintenanceEvents = maintenance.map(m => ({
              id: m.id,
              type: 'maintenance' as const,
              date: m.scheduled_date,
              status: m.status,
              service_type: m.service_type,
              description: m.description
            }));
            allEvents = [...allEvents, ...maintenanceEvents];
          }
        }
      } catch (maintenanceErr) {
        console.error("Maintenance query failed:", maintenanceErr);
        // Continue with other queries
      }

      // Fetch rental records - in separate try/catch
      try {
        // First approach - use explicit join with profiles
        const { data: rentals, error: rentalsError } = await supabase
          .from("leases")
          .select(`
            id, 
            customer_id, 
            agreement_number, 
            start_date, 
            status,
            profiles(
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

        console.log("Rental records fetched:", rentals?.length || 0);
        console.log("First rental record:", rentals?.[0] || "No rentals");

        // Add rental events to the timeline
        if (rentals && rentals.length > 0) {
          const rentalEvents = rentals.map(r => {
            // Handle profile data safely
            const customerName = r.profiles ? r.profiles.full_name : null;
            
            return {
              id: r.id,
              type: 'rental' as const,
              date: r.start_date,
              status: r.status,
              customer_id: r.customer_id,
              customer_name: customerName,
              agreement_number: r.agreement_number
            };
          });
          allEvents = [...allEvents, ...rentalEvents];
        }
      } catch (rentalsErr) {
        console.error("Rentals query failed:", rentalsErr);
        
        // Fallback approach if the first query fails
        try {
          console.log("Attempting fallback approach for rentals...");
          
          // Get agreements first
          const { data: leases, error: leasesError } = await supabase
            .from("leases")
            .select(`
              id, 
              customer_id, 
              agreement_number, 
              start_date, 
              status
            `)
            .eq("vehicle_id", vehicleId)
            .order("start_date", { ascending: false });
            
          if (leasesError) {
            console.error("Error fetching leases in fallback:", leasesError);
            throw leasesError;
          }
          
          console.log("Leases fetched in fallback:", leases?.length || 0);
          
          if (leases && leases.length > 0) {
            // Get all customer IDs
            const customerIds = leases.map(lease => lease.customer_id).filter(Boolean);
            
            if (customerIds.length > 0) {
              // Get customer data for these IDs
              const { data: customers, error: customersError } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", customerIds);
                
              if (customersError) {
                console.error("Error fetching customer profiles:", customersError);
              }
              
              console.log("Customer profiles fetched:", customers?.length || 0);
              
              // Create a map for quick lookups
              const customerMap = new Map();
              if (customers) {
                customers.forEach(customer => {
                  customerMap.set(customer.id, customer.full_name);
                });
              }
              
              // Map lease data to events with customer names
              const rentalEvents = leases.map(lease => ({
                id: lease.id,
                type: 'rental' as const,
                date: lease.start_date,
                status: lease.status,
                customer_id: lease.customer_id,
                customer_name: customerMap.get(lease.customer_id) || "Unknown Customer",
                agreement_number: lease.agreement_number
              }));
              
              allEvents = [...allEvents, ...rentalEvents];
            }
          }
        } catch (fallbackErr) {
          console.error("Rentals fallback query failed:", fallbackErr);
        }
      }

      // Fetch damage records - in separate try/catch
      try {
        const { data: damages, error: damagesError } = await supabase
          .from("damages")
          .select(`
            id,
            description,
            reported_date,
            source,
            lease_id
          `)
          .eq("vehicle_id", vehicleId)
          .order("reported_date", { ascending: false });
            
        if (damagesError) {
          console.error("Error fetching damage records:", damagesError);
        } else {
          console.log("Damage records fetched:", damages?.length || 0);

          // Get leases data for customer names if there are damages with lease_id
          const damagesWithLeaseIds = damages?.filter(d => d.lease_id) || [];
          let leaseCustomerMap = new Map();
          
          if (damagesWithLeaseIds.length > 0) {
            const leaseIds = damagesWithLeaseIds.map(d => d.lease_id).filter(Boolean);
            
            try {
              const { data: leases } = await supabase
                .from("leases")
                .select(`
                  id,
                  customer_id,
                  profiles:customer_id (
                    full_name
                  )
                `)
                .in("id", leaseIds);
                
              if (leases && leases.length > 0) {
                leases.forEach(lease => {
                  leaseCustomerMap.set(lease.id, lease.profiles?.full_name || "Unknown Customer");
                });
              }
            } catch (leaseErr) {
              console.error("Error fetching lease data for damages:", leaseErr);
            }
          }

          // Add damage events to the timeline
          if (damages && damages.length > 0) {
            const damageEvents = damages.map(d => {
              // Get customer name from lease if possible
              let customerName = "System Inspection";
              if (d.lease_id && leaseCustomerMap.has(d.lease_id)) {
                customerName = leaseCustomerMap.get(d.lease_id);
              }
              
              return {
                id: d.id,
                type: 'damage' as const,
                date: d.reported_date,
                description: d.description,
                source: d.source,
                customer_name: customerName
              };
            });
            allEvents = [...allEvents, ...damageEvents];
          }
        }
      } catch (damagesErr) {
        console.error("Damages query failed:", damagesErr);
        // Continue with other data
      }

      // Check if we have any events
      if (allEvents.length === 0) {
        console.log("No timeline events found for this vehicle");
      } else {
        console.log("Total timeline events:", allEvents.length);
      }

      // Sort all events by date (latest first)
      allEvents.sort((a, b) => {
        // Handle potential null/undefined dates
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      return allEvents;
    },
    retry: 1,
    staleTime: 30000 // Consider data fresh for 30 seconds
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
            {event.customer_name ? (
              <button 
                onClick={() => setSelectedCustomerId(event.customer_id || null)} 
                className="text-primary hover:underline font-medium"
              >
                {event.customer_name}
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
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span>{event.description}</span>
            {event.source && (
              <>
                <span className="text-muted-foreground mx-1">•</span>
                <span className="text-sm text-muted-foreground">Reported by: {event.customer_name || 'System'}</span>
              </>
            )}
          </div>
        );
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
