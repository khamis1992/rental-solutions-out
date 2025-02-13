import { useParams, useNavigate } from "react-router-dom";
import { VehicleOverview } from "./profile/VehicleOverview";
import { VehicleDocuments } from "./profile/VehicleDocuments";
import { MaintenanceHistory } from "./profile/MaintenanceHistory";
import { DamageHistory } from "./profile/DamageHistory";
import { VehicleTimeline } from "./profile/VehicleTimeline";
import { VehicleQRCode } from "./profile/VehicleQRCode";
import { VehicleInsurance } from "./profile/VehicleInsurance";
import { VehicleStatus } from "./profile/VehicleStatus";
import { DocumentExpiryNotifications } from "./profile/DocumentExpiryNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Car, AlertTriangle, Gauge, Calendar, Wrench, AlertOctagon, Share2, Printer, Copy, CarTaxiFront, MapPin } from "lucide-react";
export const VehicleDetails = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    data: vehicle,
    isLoading
  } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      if (!id) return null;
      const {
        data,
        error
      } = await supabase.from("vehicles").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
  const handleCopyLicensePlate = () => {
    if (vehicle?.license_plate) {
      navigator.clipboard.writeText(vehicle.license_plate);
      toast.success("License plate copied to clipboard");
    }
  };
  if (!id) {
    return <Card className="mx-auto max-w-lg mt-8">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4">Vehicle ID is required</h2>
          <Button onClick={() => navigate("/vehicles")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicles
          </Button>
        </CardContent>
      </Card>;
  }
  if (isLoading) {
    return <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[200px] rounded-lg" />
          <Skeleton className="h-[200px] rounded-lg" />
        </div>
        <Skeleton className="h-[300px] rounded-lg" />
      </div>;
  }
  if (!vehicle) {
    return <Card className="mx-auto max-w-lg mt-8">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4">Vehicle not found</h2>
          <Button onClick={() => navigate("/vehicles")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicles
          </Button>
        </CardContent>
      </Card>;
  }
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div className="space-y-8 p-6">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/vehicles")} className="shrink-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Car className="h-6 w-6 text-primary" />
                <CarTaxiFront className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-sm py-[6px] font-extrabold text-blue-950 my-[12px]">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(vehicle.status)}>
                    {vehicle.status || 'Unknown Status'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleCopyLicensePlate}>
              <Copy className="h-4 w-4 mr-2" />
              {vehicle.license_plate}
            </Button>
            <Button variant="outline" size="icon" className="hidden sm:flex" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="hidden sm:flex">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Gauge className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Mileage</p>
              <p className="font-medium">{vehicle.mileage?.toLocaleString() || 'N/A'} km</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="font-medium">{vehicle.year}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{vehicle.location || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <AlertOctagon className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Insurance</p>
              <p className="font-medium">{vehicle.insurance_company || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <VehicleQRCode make={vehicle.make} model={vehicle.model} vehicleId={id} year={vehicle.year} licensePlate={vehicle.license_plate} vin={vehicle.vin} />
        </div>
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <VehicleStatus vehicleId={id} currentStatus={vehicle.status} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
        <DocumentExpiryNotifications vehicleId={id} />
      </div>
      
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <VehicleOverview vehicleId={id} />
      </div>

      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <VehicleInsurance vehicleId={id} />
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <VehicleDocuments vehicleId={id} />
        </div>
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <MaintenanceHistory vehicleId={id} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <DamageHistory vehicleId={id} />
      </div>

      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <VehicleTimeline vehicleId={id} />
      </div>
    </div>;
};