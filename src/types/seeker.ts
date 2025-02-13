
export type SeekerTargetStatus = 'active' | 'inactive' | 'paused';

export interface SeekerTarget {
  id: string;
  user_id: string;
  target_name: string;
  target_type: string;
  status: SeekerTargetStatus;
  last_seen_at: string | null;
  last_location_lat: number | null;
  last_location_lng: number | null;
  battery_level: number | null;
  network_type: string | null;
  device_info: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SeekerLocationHistory {
  id: string;
  target_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  battery_level: number | null;
  network_type: string | null;
  device_info: Record<string, any>;
  timestamp: string;
}

export interface SeekerAlert {
  id: string;
  target_id: string;
  alert_type: string;
  alert_severity: string;
  message: string;
  location_lat: number | null;
  location_lng: number | null;
  is_read: boolean;
  created_at: string;
}
