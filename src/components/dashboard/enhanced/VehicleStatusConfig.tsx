
import { 
  AlertTriangle, 
  Building, 
  Car, 
  CheckCircle2, 
  AlertCircle,
  Wrench, 
  Key, 
  Lock, 
  Ban,
  ParkingCircle
} from "lucide-react";
import { StatusConfigMap } from "@/types/dashboard.types";

export const STATUS_CONFIG: StatusConfigMap = {
  available: { 
    color: "#10B981", 
    label: "Available", 
    bgColor: "bg-emerald-500/10",
    icon: <Car className="text-emerald-500" />,
  },
  rented: { 
    color: "#3B82F6", 
    label: "Rented Out", 
    bgColor: "bg-blue-500/10",
    icon: <Key className="text-blue-500" />,
  },
  maintenance: { 
    color: "#F59E0B", 
    label: "In Maintenance", 
    bgColor: "bg-amber-500/10",
    icon: <Wrench className="text-amber-500" />,
  },
  reserve: { 
    color: "#8B5CF6", 
    label: "In Reserve", 
    bgColor: "bg-violet-500/10",
    icon: <ParkingCircle className="text-violet-500" />,
  },
  police_station: { 
    color: "#8B5CF6", 
    label: "At Police Station", 
    bgColor: "bg-violet-500/10",
    icon: <Building className="text-violet-500" />,
  },
  accident: { 
    color: "#EF4444", 
    label: "In Accident", 
    bgColor: "bg-red-500/10",
    icon: <AlertTriangle className="text-red-500" />,
  },
  stolen: { 
    color: "#1F2937", 
    label: "Reported Stolen", 
    bgColor: "bg-gray-800/10",
    icon: <Ban className="text-gray-800 dark:text-gray-200" />,
  },
  retired: { 
    color: "#6B7280", 
    label: "Retired", 
    bgColor: "bg-gray-500/10",
    icon: <Lock className="text-gray-500" />,
  },
  pending_repair: { 
    color: "#F59E0B", 
    label: "Pending Repair", 
    bgColor: "bg-amber-500/10",
    icon: <Wrench className="text-amber-500" />,
  }
};

export const GROUP_ICONS = {
  operational: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  attention: <AlertCircle className="h-5 w-5 text-amber-500" />,
  critical: <AlertTriangle className="h-5 w-5 text-red-500" />
};

export const getStatusGroup = (status: string): 'operational' | 'attention' | 'critical' => {
  switch (status) {
    case 'available':
    case 'rented':
    case 'reserve':
      return 'operational';
    case 'maintenance':
    case 'pending_repair':
    case 'retired':
    case 'police_station':
      return 'attention';
    case 'accident':
    case 'stolen':
      return 'critical';
    default:
      return 'attention';
  }
};
