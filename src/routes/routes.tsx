
import { lazy } from "react";

export const routes = [
  {
    path: "/email-test",
    element: lazy(() => import("@/pages/EmailTest")),
    name: "Email Test",
  },
] as const;

// Define all the route types needed by App.tsx
export const Auth = {
  path: "/auth",
  element: lazy(() => import("@/pages/Auth")),
  name: "Auth",
};

export const CustomerPortal = {
  path: "/customer-portal",
  element: lazy(() => import("@/pages/CustomerPortal")),
  name: "Customer Portal",
};

export const Dashboard = {
  path: "/dashboard",
  element: lazy(() => import("@/pages/Dashboard")),
  name: "Dashboard",
};

export const Agreements = {
  path: "/agreements",
  element: lazy(() => import("@/pages/Agreements")),
  name: "Agreements",
};

export const AgreementCreate = {
  path: "/agreements/create",
  element: lazy(() => import("@/pages/AgreementCreate")),
  name: "Create Agreement",
};

export const AgreementDetails = {
  path: "/agreements/:id",
  element: lazy(() => import("@/pages/AgreementDetails")),
  name: "Agreement Details",
};

export const AgreementPayments = {
  path: "/agreements/:id/payments",
  element: lazy(() => import("@/pages/AgreementPayments")),
  name: "Agreement Payments",
};

export const Vehicles = {
  path: "/vehicles",
  element: lazy(() => import("@/pages/Vehicles")),
  name: "Vehicles",
};

export const VehicleDetails = {
  path: "/vehicles/:id",
  element: lazy(() => import("@/pages/VehicleDetails")),
  name: "Vehicle Details",
};

export const Customers = {
  path: "/customers",
  element: lazy(() => import("@/pages/Customers")),
  name: "Customers",
};

export const CustomerProfile = {
  path: "/customers/:id",
  element: lazy(() => import("@/pages/CustomerProfile")),
  name: "Customer Profile",
};

export const RemainingAmount = {
  path: "/remaining-amount",
  element: lazy(() => import("@/pages/RemainingAmount")),
  name: "Remaining Amount",
};

export const Settings = {
  path: "/settings",
  element: lazy(() => import("@/pages/Settings")),
  name: "Settings",
};

export const Maintenance = {
  path: "/maintenance",
  element: lazy(() => import("@/pages/Maintenance")),
  name: "Maintenance",
};

export const ChauffeurService = {
  path: "/chauffeur",
  element: lazy(() => import("@/pages/ChauffeurService")),
  name: "Chauffeur Service",
};

export const TrafficFines = {
  path: "/traffic-fines",
  element: lazy(() => import("@/pages/TrafficFines")),
  name: "Traffic Fines",
};

export const Reports = {
  path: "/reports",
  element: lazy(() => import("@/pages/Reports")),
  name: "Reports",
};

export const Finance = {
  path: "/finance",
  element: lazy(() => import("@/pages/Finance")),
  name: "Finance",
};

export const CarInstallmentDetails = {
  path: "/finance/car-installments/:id",
  element: lazy(() => import("@/pages/CarInstallmentDetails")),
  name: "Car Installment Details",
};

export const Help = {
  path: "/help",
  element: lazy(() => import("@/pages/Help")),
  name: "Help",
};

export const Legal = {
  path: "/legal",
  element: lazy(() => import("@/pages/Legal")),
  name: "Legal",
};

export const Audit = {
  path: "/audit",
  element: lazy(() => import("@/pages/Audit")),
  name: "Audit",
};

export const LocationTracking = {
  path: "/location-tracking",
  element: lazy(() => import("@/pages/LocationTracking")),
  name: "Location Tracking",
};

export const Sales = {
  path: "/sales",
  element: lazy(() => import("@/pages/Sales")),
  name: "Sales",
};

export const publicRoutes = [];
