
import { useParams } from "react-router-dom";
import { VehicleDetails as VehicleDetailsComponent } from "@/components/vehicles/VehicleDetails";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const { session } = useAuth();

  // If accessed via QR code (no session), the ProtectedRoute will handle the redirect
  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <VehicleDetailsComponent />
      </div>
    </DashboardLayout>
  );
};

export default VehicleDetailsPage;
