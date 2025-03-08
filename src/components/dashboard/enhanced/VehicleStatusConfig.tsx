
import { Car, Wrench, AlertTriangle, X, ShieldCheck, ThumbsUp, HelpCircle } from "lucide-react";
import { StatusConfigMap } from "@/types/dashboard.types";

export const STATUS_CONFIG: StatusConfigMap = {
  available: {
    color: "#22c55e",
    bgColor: "#22c55e10",
    label: "Available",
    icon: <Car className="h-5 w-5 text-green-500" />,
    description: "Vehicles ready to be rented",
    gradient: "from-green-50 to-green-100",
  },
  rented: {
    color: "#3b82f6",
    bgColor: "#3b82f610",
    label: "Rented",
    icon: <Car className="h-5 w-5 text-blue-500" />,
    description: "Vehicles currently rented out",
    gradient: "from-blue-50 to-blue-100",
  },
  maintenance: {
    color: "#f59e0b",
    bgColor: "#f59e0b10",
    label: "Maintenance",
    icon: <Wrench className="h-5 w-5 text-amber-500" />,
    description: "Vehicles undergoing service or repair",
    gradient: "from-amber-50 to-amber-100",
  },
  accident: {
    color: "#ef4444",
    bgColor: "#ef444410",
    label: "Accident",
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    description: "Vehicles involved in accidents",
    gradient: "from-red-50 to-red-100",
  },
  stolen: {
    color: "#6b7280",
    bgColor: "#6b728010",
    label: "Stolen",
    icon: <X className="h-5 w-5 text-gray-500" />,
    description: "Vehicles reported as stolen",
    gradient: "from-gray-100 to-gray-200",
  },
  retired: {
    color: "#9ca3af",
    bgColor: "#9ca3af10",
    label: "Retired",
    icon: <X className="h-5 w-5 text-gray-400" />,
    description: "Vehicles removed from the fleet",
    gradient: "from-gray-50 to-gray-100",
  },
  pending_repair: {
    color: "#d97706",
    bgColor: "#d9770610",
    label: "Pending Repair",
    icon: <Wrench className="h-5 w-5 text-amber-600" />,
    description: "Vehicles awaiting repair",
    gradient: "from-amber-50 to-amber-100",
  },
  reserve: {
    color: "#8b5cf6",
    bgColor: "#8b5cf610",
    label: "Reserve",
    icon: <ShieldCheck className="h-5 w-5 text-violet-500" />,
    description: "Vehicles held in reserve",
    gradient: "from-violet-50 to-violet-100",
  },
  police_station: {
    color: "#1e40af",
    bgColor: "#1e40af10",
    label: "Police Station",
    icon: <ShieldCheck className="h-5 w-5 text-blue-800" />,
    description: "Vehicles at police station",
    gradient: "from-blue-50 to-blue-200",
  },
  unknown: {
    color: "#6b7280",
    bgColor: "#6b728010",
    label: "Unknown",
    icon: <HelpCircle className="h-5 w-5 text-gray-500" />,
    description: "Status unknown",
    gradient: "from-gray-50 to-gray-100",
  },
};

export default STATUS_CONFIG;
