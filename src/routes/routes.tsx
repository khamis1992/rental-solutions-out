import { lazy } from "react";

import { CalendarIcon } from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { ListChecks } from "lucide-react";
import { Users } from "lucide-react";
import { Car } from "lucide-react";
import { Mail } from "lucide-react";
import { Settings } from "lucide-react";
import { FileBarGraph } from "lucide-react";
import { PhoneCall } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { UserPlus } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { BadgeCheck } from "lucide-react";
import { CircleUserRound } from "lucide-react";

import { Shell } from "@/components/shells/shell";

export const routes = [
  {
    path: "/",
    element: lazy(() => import("@/pages/LandingPage")),
    name: "Landing",
  },
  {
    path: "/dashboard",
    element: lazy(() => import("@/pages/DashboardPage")),
    name: "Dashboard",
    icon: LayoutDashboard,
    shell: Shell,
  },
  {
    path: "/vehicles",
    element: lazy(() => import("@/pages/VehiclesPage")),
    name: "Vehicles",
    icon: Car,
    shell: Shell,
  },
  {
    path: "/sales",
    element: lazy(() => import("@/pages/SalesPage")),
    name: "Sales",
    icon: FileBarGraph,
    shell: Shell,
  },
  {
    path: "/sales/leads",
    element: lazy(() => import("@/pages/sales/LeadsPage")),
    name: "Leads",
    icon: UserPlus,
    shell: Shell,
  },
  {
    path: "/sales/leads/:id",
    element: lazy(() => import("@/pages/sales/LeadDetailsPage")),
    name: "Lead Details",
    shell: Shell,
  },
  {
    path: "/sales/customers",
    element: lazy(() => import("@/pages/sales/CustomersPage")),
    name: "Customers",
    icon: CircleUserRound,
    shell: Shell,
  },
  {
    path: "/sales/deals",
    element: lazy(() => import("@/pages/sales/DealsPage")),
    name: "Deals",
    icon: BadgeCheck,
    shell: Shell,
  },
  {
    path: "/sales/communications",
    element: lazy(() => import("@/pages/sales/CommunicationsPage")),
    name: "Communications",
    icon: Mail,
    shell: Shell,
  },
  {
    path: "/sales/communications/calls",
    element: lazy(() => import("@/pages/sales/CallsPage")),
    name: "Calls",
    icon: PhoneCall,
    shell: Shell,
  },
  {
    path: "/sales/communications/sms",
    element: lazy(() => import("@/pages/sales/SMSPage")),
    name: "SMS",
    icon: MessageSquare,
    shell: Shell,
  },
  {
    path: "/tasks",
    element: lazy(() => import("@/pages/TasksPage")),
    name: "Tasks",
    icon: ListChecks,
    shell: Shell,
  },
  {
    path: "/calendar",
    element: lazy(() => import("@/pages/CalendarPage")),
    name: "Calendar",
    icon: CalendarIcon,
    shell: Shell,
  },
  {
    path: "/users",
    element: lazy(() => import("@/pages/UsersPage")),
    name: "Users",
    icon: Users,
    shell: Shell,
  },
  {
    path: "/settings",
    element: lazy(() => import("@/pages/SettingsPage")),
    name: "Settings",
    icon: Settings,
    shell: Shell,
  },
  {
    path: "/email-test",
    element: lazy(() => import("@/pages/EmailTest")),
    name: "Email Test",
  },
] as const;

export const publicRoutes = [
  {
    path: "/login",
    element: lazy(() => import("@/pages/LoginPage")),
    name: "Login",
  },
  {
    path: "/signup",
    element: lazy(() => import("@/pages/SignupPage")),
    name: "Sign Up",
  },
  {
    path: "/forgot-password",
    element: lazy(() => import("@/pages/ForgotPasswordPage")),
    name: "Forgot Password",
  },
  {
    path: "/reset-password",
    element: lazy(() => import("@/pages/ResetPasswordPage")),
    name: "Reset Password",
  },
  {
    path: "/verify-email",
    element: lazy(() => import("@/pages/VerifyEmailPage")),
    name: "Verify Email",
  },
];
