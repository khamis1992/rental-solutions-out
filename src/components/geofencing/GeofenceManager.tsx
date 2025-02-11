import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GeofenceMap } from './GeofenceMap';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GeofenceZone } from '@/types/geofence';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

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

  const { data: geofences, refetch: refetchGeofences } = useQuery({
    queryKey: ['geofences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geofence_zones')
        .select('*');
      if (error) throw error;
      return data as GeofenceZone[];
    },
  });

  const { data: geofenceEvents } = useQuery({
    queryKey: ['geofence-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geofence_events')
        .select(`
          *,
          geofence_zones (
            name,
            type
          ),
          profiles:user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const handleGeofenceCreate = async (geofenceData: Partial<GeofenceZone>) => {
    try {
      if (!formData.name) {
        toast.error('Please enter a name for the geofence');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const newGeofence = {
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
      refetchGeofences();
    } catch (error) {
      console.error('Error creating geofence:', error);
      toast.error('Failed to create geofence');
    }
  };

  const handleGeofenceUpdate = async (geofenceData: GeofenceZone) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const updateData = {
        ...geofenceData,
        ...(geofenceData.type === 'circle' ? {
          coordinates: null
        } : {
          center_lat: null,
          center_lng: null,
          radius: null
        })
      };

      const { error } = await supabase
        .from('geofence_zones')
        .update(updateData)
        .eq('id', geofenceData.id);

      if (error) throw error;

      toast.success('Geofence updated successfully');
      refetchGeofences();
    } catch (error) {
      console.error('Error updating geofence:', error);
      toast.error('Failed to update geofence');
    }
  };

  const handleGeofenceDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('geofence_zones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Geofence deleted successfully');
      refetchGeofences();
    } catch (error) {
      console.error('Error deleting geofence:', error);
      toast.error('Failed to delete geofence');
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="zones">
        <TabsList>
          <TabsTrigger value="zones">Geofence Zones</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="space-y-4">
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
                onGeofenceUpdate={handleGeofenceUpdate}
                geofences={geofences}
              />
            </Card>
          )}

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Geofence List</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {geofences?.map((geofence) => (
                  <TableRow key={geofence.id}>
                    <TableCell>{geofence.name}</TableCell>
                    <TableCell>{geofence.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {geofence.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {geofence.type === 'circle' ? (
                        <span className="text-sm text-muted-foreground">
                          Radius: {geofence.radius?.toFixed(0)}m
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Points: {geofence.coordinates?.length || 0}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleGeofenceDelete(geofence.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!geofences || geofences.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No geofences found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Geofence Events</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {geofenceEvents?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.profiles?.full_name || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{event.geofence_zones?.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {event.geofence_zones?.type} zone
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={event.event_type === 'enter' ? 'success' : 'destructive'}
                        className="capitalize"
                      >
                        {event.event_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {event.location_lat.toFixed(6)}, {event.location_lng.toFixed(6)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(event.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                  </TableRow>
                ))}
                {(!geofenceEvents || geofenceEvents.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No events recorded
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
