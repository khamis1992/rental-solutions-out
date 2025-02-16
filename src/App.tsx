
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingOverlay } from "@/components/ui/loading/LoadingOverlay";
import { Toaster } from "@/components/ui/sonner";
import * as Pages from "@/routes/routes";

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingOverlay />}>
        <Routes>
          <Route path="/" element={<Pages.Dashboard />} />
          <Route path="/auth" element={<Pages.Auth />} />
          <Route path="/vehicles" element={<Pages.Vehicles />} />
          <Route path="/vehicle-types" element={<Pages.VehicleTypes />} />
          <Route path="/vehicles/:id" element={<Pages.VehicleDetails />} />
          <Route path="/customers" element={<Pages.Customers />} />
          <Route path="/customers/:id" element={<Pages.CustomerProfile />} />
          <Route path="/agreements" element={<Pages.Agreements />} />
          <Route path="/remaining-amount" element={<Pages.RemainingAmount />} />
          <Route path="/settings" element={<Pages.Settings />} />
          <Route path="/maintenance" element={<Pages.Maintenance />} />
          <Route path="/traffic-fines" element={<Pages.TrafficFines />} />
          <Route path="/reports" element={<Pages.Reports />} />
          <Route path="/finance" element={<Pages.Finance />} />
          <Route path="/help" element={<Pages.Help />} />
          <Route path="/legal" element={<Pages.Legal />} />
          <Route path="/audit" element={<Pages.Audit />} />
          <Route path="/chauffeur" element={<Pages.ChauffeurService />} />
          <Route path="/customer-portal" element={<Pages.CustomerPortal />} />
          <Route path="/car-installment-details" element={<Pages.CarInstallmentDetails />} />
          <Route path="/location-tracking" element={<Pages.LocationTracking />} />
          <Route path="/sales" element={<Pages.Sales />} />
          <Route path="/sales/onboarding" element={<Pages.SalesOnboarding />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}
