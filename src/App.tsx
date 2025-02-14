
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import * as Pages from "@/routes/routes";
import { AuthGuard } from "@/components/auth/AuthGuard";

const App = () => {
  return (
    <Router>
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        }
      >
        <Routes>
          <Route path="/auth" element={<Pages.Auth />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <Pages.Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/vehicles"
            element={
              <AuthGuard>
                <Pages.Vehicles />
              </AuthGuard>
            }
          />
          <Route
            path="/vehicles/:id"
            element={
              <AuthGuard>
                <Pages.VehicleDetails />
              </AuthGuard>
            }
          />
          <Route
            path="/customers"
            element={
              <AuthGuard>
                <Pages.Customers />
              </AuthGuard>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <AuthGuard>
                <Pages.CustomerProfile />
              </AuthGuard>
            }
          />
          <Route
            path="/agreements"
            element={
              <AuthGuard>
                <Pages.Agreements />
              </AuthGuard>
            }
          />
          <Route
            path="/remaining-amount"
            element={
              <AuthGuard>
                <Pages.RemainingAmount />
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <Pages.Settings />
              </AuthGuard>
            }
          />
          <Route
            path="/maintenance"
            element={
              <AuthGuard>
                <Pages.Maintenance />
              </AuthGuard>
            }
          />
          <Route
            path="/traffic-fines"
            element={
              <AuthGuard>
                <Pages.TrafficFines />
              </AuthGuard>
            }
          />
          <Route
            path="/reports"
            element={
              <AuthGuard>
                <Pages.Reports />
              </AuthGuard>
            }
          />
          <Route
            path="/finance"
            element={
              <AuthGuard>
                <Pages.Finance />
              </AuthGuard>
            }
          />
          <Route
            path="/help"
            element={
              <AuthGuard>
                <Pages.Help />
              </AuthGuard>
            }
          />
          <Route
            path="/legal"
            element={
              <AuthGuard>
                <Pages.Legal />
              </AuthGuard>
            }
          />
          <Route
            path="/audit"
            element={
              <AuthGuard>
                <Pages.Audit />
              </AuthGuard>
            }
          />
          <Route
            path="/chauffeur-service"
            element={
              <AuthGuard>
                <Pages.ChauffeurService />
              </AuthGuard>
            }
          />
          <Route
            path="/customer-portal"
            element={
              <AuthGuard>
                <Pages.CustomerPortal />
              </AuthGuard>
            }
          />
          <Route
            path="/car-installment-details"
            element={
              <AuthGuard>
                <Pages.CarInstallmentDetails />
              </AuthGuard>
            }
          />
          <Route
            path="/location-tracking"
            element={
              <AuthGuard>
                <Pages.LocationTracking />
              </AuthGuard>
            }
          />
          <Route
            path="/sales"
            element={
              <AuthGuard>
                <Pages.Sales />
              </AuthGuard>
            }
          />
          <Route
            path="/master-sheet"
            element={
              <AuthGuard>
                <Pages.MasterSheet />
              </AuthGuard>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
