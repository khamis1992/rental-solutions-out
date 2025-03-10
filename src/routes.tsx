import { lazy } from "react";

import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { RouteObject } from "react-router-dom";
import { SuspenseLoading } from "@/components/ui/suspense-loading";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminGuard } from "@/components/auth/AdminGuard";

const Home = lazy(() => import("./pages/Home"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Profile = lazy(() => import("./pages/Profile"));
const Customers = lazy(() => import("./pages/Customers"));
const CustomerDetails = lazy(() => import("./pages/CustomerDetails"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const VehicleDetails = lazy(() => import("./pages/VehicleDetails"));
const Agreements = lazy(() => import("./pages/Agreements"));
const AgreementDetails = lazy(() => import("./pages/AgreementDetails"));
const AgreementPayments = lazy(() => import("./pages/AgreementPayments"));
const FinanceDashboard = lazy(() => import("./pages/finance/FinanceDashboard"));
const FinanceTransactions = lazy(() => import("./pages/finance/FinanceTransactions"));
const FinanceCategories = lazy(() => import("./pages/finance/FinanceCategories"));
const CarInstallments = lazy(() => import("./pages/finance/CarInstallments"));
const CarInstallmentDetails = lazy(() => import("./components/finance/car-installments/CarInstallmentDetails").then(module => ({ default: module.CarInstallmentDetails })));
const ReportsDashboard = lazy(() => import("./pages/reports/ReportsDashboard"));
const PendingPaymentsReport = lazy(() => import("./pages/reports/PendingPaymentsReport"));
const TrafficFinesReport = lazy(() => import("./pages/reports/TrafficFinesReport"));
const TrafficFines = lazy(() => import("./pages/TrafficFines"));
const TrafficFineDetails = lazy(() => import("./pages/TrafficFineDetails"));
const Settings = lazy(() => import("./pages/Settings"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));

// Add the import for the new PaymentTools page
import PaymentTools from "./pages/admin/PaymentTools";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <Home />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/sign-in",
    element: (
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <SuspenseLoading>
          <SignIn />
        </SuspenseLoading>
      </ErrorBoundary>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <SuspenseLoading>
          <SignUp />
        </SuspenseLoading>
      </ErrorBoundary>
    ),
  },
  {
    path: "/profile",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <Profile />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/customers",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <Customers />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/customers/:id",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <CustomerDetails />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/vehicles",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <Vehicles />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/vehicles/:id",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <VehicleDetails />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/agreements",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <Agreements />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/agreements/:id",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <AgreementDetails />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/agreements/:id/payments",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <AgreementPayments />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/finance",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <FinanceDashboard />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/finance/transactions",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <FinanceTransactions />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/finance/categories",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <FinanceCategories />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/finance/car-installments",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <CarInstallments />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/finance/car-installments/:id",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <CarInstallmentDetails />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/reports",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <ReportsDashboard />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/reports/pending-payments",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <PendingPaymentsReport />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/reports/traffic-fines",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <TrafficFinesReport />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/traffic-fines",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <TrafficFines />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/traffic-fines/:id",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <TrafficFineDetails />
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/settings",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <AdminGuard>
                <Settings />
              </AdminGuard>
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  {
    path: "/audit-logs",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <AdminGuard>
                <AuditLogs />
              </AdminGuard>
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
  // Add the new route to the router configuration
  {
    path: "admin/payment-tools",
    element: (
      <Layout>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <SuspenseLoading>
            <AuthGuard>
              <AdminGuard>
                <PaymentTools />
              </AdminGuard>
            </AuthGuard>
          </SuspenseLoading>
        </ErrorBoundary>
      </Layout>
    ),
  },
];
