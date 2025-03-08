
import { CheckCircle2, Key, Wrench, Archive, AlertTriangle, Car } from "lucide-react";
import { StatusConfigMap } from "@/types/dashboard.types";

export const VehicleStatusConfig: StatusConfigMap = {
  available: {
    color: "#10B981",
    label: "Available",
    icon: <CheckCircle2 className="h-5 w-5 text-[#10B981]" />,
    description: "Vehicles ready for rent",
    gradient: "from-emerald-500 to-emerald-600",
    bgColor: "rgba(16, 185, 129, 0.1)"
  },
  rented: {
    color: "#3B82F6",
    label: "Rented",
    icon: <Key className="h-5 w-5 text-[#3B82F6]" />,
    description: "Currently rented vehicles",
    gradient: "from-blue-500 to-blue-600",
    bgColor: "rgba(59, 130, 246, 0.1)"
  },
  maintenance: {
    color: "#F59E0B",
    label: "Maintenance",
    icon: <Wrench className="h-5 w-5 text-[#F59E0B]" />,
    description: "Vehicles under maintenance",
    gradient: "from-amber-500 to-amber-600",
    bgColor: "rgba(245, 158, 11, 0.1)"
  },
  retired: {
    color: "#6B7280",
    label: "Retired",
    icon: <Archive className="h-5 w-5 text-[#6B7280]" />,
    description: "Vehicles no longer in service",
    gradient: "from-gray-500 to-gray-600",
    bgColor: "rgba(107, 114, 128, 0.1)"
  },
  accident: {
    color: "#EF4444",
    label: "Accident",
    icon: <AlertTriangle className="h-5 w-5 text-[#EF4444]" />,
    description: "Vehicles involved in accidents",
    gradient: "from-red-500 to-red-600",
    bgColor: "rgba(239, 68, 68, 0.1)"
  },
  stolen: {
    color: "#1F2937",
    label: "Stolen",
    icon: <AlertTriangle className="h-5 w-5 text-[#1F2937]" />,
    description: "Vehicles reported as stolen",
    gradient: "from-gray-800 to-gray-900",
    bgColor: "rgba(31, 41, 55, 0.1)"
  },
  reserve: {
    color: "#8B5CF6",
    label: "Reserved",
    icon: <Car className="h-5 w-5 text-[#8B5CF6]" />,
    description: "Reserved vehicles",
    gradient: "from-violet-500 to-violet-600",
    bgColor: "rgba(139, 92, 246, 0.1)"
  },
  police_station: {
    color: "#8B5CF6",
    label: "Police Station",
    icon: <AlertTriangle className="h-5 w-5 text-[#8B5CF6]" />,
    description: "Vehicles at police station",
    gradient: "from-violet-500 to-violet-600",
    bgColor: "rgba(139, 92, 246, 0.1)"
  },
  pending_repair: {
    color: "#F59E0B",
    label: "Pending Repair",
    icon: <Wrench className="h-5 w-5 text-[#F59E0B]" />,
    description: "Vehicles waiting for repair",
    gradient: "from-amber-500 to-amber-600",
    bgColor: "rgba(245, 158, 11, 0.1)"
  }
};
