import { NavLink } from "react-router-dom";
import {
  Car,
  Users,
  FileText,
  Settings,
  Tool,
  AlertTriangle,
  BarChart3,
  DollarSign,
  HelpCircle,
  Scale,
  ClipboardList,
  ChevronDown,
  Timer,
  MapPin,
  Briefcase,
  UserCircle,
  Receipt,
  Building2,
  Clipboard,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Dashboard
          </h2>
          <div className="space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </NavLink>
            
            <NavLink
              to="/vehicles"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <Car className="mr-2 h-4 w-4" />
              Vehicles
            </NavLink>

            <NavLink
              to="/vehicle-types"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <Clipboard className="mr-2 h-4 w-4" />
              Vehicle Types
            </NavLink>

            <NavLink
              to="/customers"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <Users className="mr-2 h-4 w-4" />
              Customers
            </NavLink>
            <NavLink
              to="/agreements"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              Agreements
            </NavLink>
            <NavLink
              to="/remaining-amount"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Remaining Amount
            </NavLink>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Operations
          </h2>
          <div className="space-y-1">
            <NavLink
              to="/maintenance"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <Tool className="mr-2 h-4 w-4" />
              Maintenance
            </NavLink>
            <NavLink
              to="/traffic-fines"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Traffic Fines
            </NavLink>
            <NavLink
              to="/location-tracking"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <MapPin className="mr-2 h-4 w-4" />
              Location Tracking
            </NavLink>
            <NavLink
              to="/chauffeur"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <Timer className="mr-2 h-4 w-4" />
              Chauffeur Service
            </NavLink>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Reporting
          </h2>
          <div className="space-y-1">
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Reports
            </NavLink>
            <NavLink
              to="/finance"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Finance
            </NavLink>
            <NavLink
              to="/sales"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Sales
            </NavLink>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Administration
          </h2>
          <div className="space-y-1">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </NavLink>
            <NavLink
              to="/audit"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Audit
            </NavLink>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Legal
          </h2>
          <div className="space-y-1">
            <NavLink
              to="/help"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </NavLink>
            <NavLink
              to="/legal"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <Scale className="mr-2 h-4 w-4" />
              Legal
            </NavLink>
            <NavLink
              to="/customer-portal"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Customer Portal
            </NavLink>
            <NavLink
              to="/car-installment-details"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent"
                )
              }
            >
              <Receipt className="mr-2 h-4 w-4" />
              Car Installment Details
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
