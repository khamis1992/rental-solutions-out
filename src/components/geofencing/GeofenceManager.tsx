
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GeofenceMap } from './GeofenceMap';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GeofenceZone } from '@/types/geofence';

export const GeofenceManager = () => {
  const [formData, setFormData] = useState<Pick<GeofenceZone, 'name' | 'description'>>({
    name: '',
    description: ''
  });

  const { data: mapboxToken } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      return data.token;
    }
  });

  const handleGeofenceCreate = async (geofenceData: Partial<GeofenceZone>) => {
    try {
      if (!formData.name) {
        toast.error('Please enter a name for the geofence');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const newGeofence: GeofenceZone = {
        name: formData.name,
        description: formData.description,
        type: geofenceData.type!,
        created_by: user.id,
        ...(geofenceData.type === 'circle' ? {
          center_lat: geofenceData.center_lat,
          center_lng: geofenceData.center_lng,
          radius: geofenceData.radius,
          coordinates: null
        } : {
          coordinates: geofenceData.coordinates,
          center_lat: null,
          center_lng: null,
          radius: null
        })
      };

      const { error } = await supabase
        .from('geofence_zones')
        .insert([newGeofence]);

      if (error) throw error;

      toast.success('Geofence created successfully');
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error creating geofence:', error);
      toast.error('Failed to create geofence');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter geofence name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
            />
          </div>
        </div>
      </Card>

      {mapboxToken && (
        <Card className="p-4">
          <GeofenceMap
            mapboxToken={mapboxToken}
            center={[51.5074, 25.2867]} // Default to Doha coordinates
            onGeofenceCreate={handleGeofenceCreate}
          />
        </Card>
      )}
    </div>
  );
};
