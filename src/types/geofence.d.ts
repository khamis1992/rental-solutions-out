
export type GeofenceType = 'circle' | 'polygon';

export interface GeofenceZone {
  id?: string;
  name: string;
  description?: string;
  type: GeofenceType;
  center_lat?: number | null;
  center_lng?: number | null;
  radius?: number | null;
  coordinates?: number[][] | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  is_restricted?: boolean;
}

export interface GeofenceEvent {
  id?: string;
  geofence_id: string;
  user_id: string;
  event_type: 'enter' | 'exit';
  latitude: number;
  longitude: number;
  created_at?: string;
}
