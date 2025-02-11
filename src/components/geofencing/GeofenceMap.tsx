
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Circle } from '@turf/turf';
import { Button } from '@/components/ui/button';
import { MapPin, Circle as CircleIcon, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeofenceMapProps {
  mapboxToken: string;
  center: [number, number];
  onGeofenceCreate?: (geofence: any) => void;
}

export const GeofenceMap = ({ mapboxToken, center, onGeofenceCreate }: GeofenceMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [drawMode, setDrawMode] = useState<'none' | 'circle' | 'polygon'>('none');
  const [drawingPoints, setDrawingPoints] = useState<number[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: 13
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler for drawing
    map.current.on('click', handleMapClick);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, center]);

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!map.current || drawMode === 'none' || !isDrawing) return;

    const coords = [e.lngLat.lng, e.lngLat.lat];
    setDrawingPoints(prev => [...prev, coords]);

    if (drawMode === 'circle' && drawingPoints.length === 0) {
      // For circle, we need center and one point for radius
      const point = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: coords
        }
      };

      // Add center point to map
      if (map.current) {
        map.current.addSource('center-point', {
          type: 'geojson',
          data: point
        });

        map.current.addLayer({
          id: 'center-point',
          type: 'circle',
          source: 'center-point',
          paint: {
            'circle-radius': 6,
            'circle-color': '#FF0000'
          }
        });
      }
    } else if (drawMode === 'circle' && drawingPoints.length === 1) {
      // Calculate circle and complete drawing
      const center = drawingPoints[0];
      const radius = calculateDistance(center, coords);
      
      completeGeofence({
        type: 'circle',
        center: center,
        radius: radius
      });
    }
  };

  const calculateDistance = (point1: number[], point2: number[]): number => {
    const lat1 = point1[1];
    const lon1 = point1[0];
    const lat2 = point2[1];
    const lon2 = point2[0];
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const completeGeofence = async (geofenceData: any) => {
    try {
      if (onGeofenceCreate) {
        onGeofenceCreate(geofenceData);
      }
      
      // Reset drawing state
      setDrawingPoints([]);
      setIsDrawing(false);
      setDrawMode('none');

      // Clean up temporary drawing layers
      if (map.current) {
        if (map.current.getLayer('center-point')) {
          map.current.removeLayer('center-point');
        }
        if (map.current.getSource('center-point')) {
          map.current.removeSource('center-point');
        }
      }
    } catch (error) {
      console.error('Error creating geofence:', error);
      toast.error('Failed to create geofence');
    }
  };

  const startDrawing = (mode: 'circle' | 'polygon') => {
    setDrawMode(mode);
    setIsDrawing(true);
    setDrawingPoints([]);
  };

  const cancelDrawing = () => {
    setDrawMode('none');
    setIsDrawing(false);
    setDrawingPoints([]);
    
    // Clean up temporary drawing layers
    if (map.current) {
      if (map.current.getLayer('center-point')) {
        map.current.removeLayer('center-point');
      }
      if (map.current.getSource('center-point')) {
        map.current.removeSource('center-point');
      }
    }
  };

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Drawing controls */}
      <div className="absolute top-4 left-4 space-y-2">
        <Button
          variant={drawMode === 'circle' ? "secondary" : "default"}
          size="sm"
          onClick={() => startDrawing('circle')}
          disabled={isDrawing && drawMode !== 'circle'}
        >
          <CircleIcon className="w-4 h-4 mr-2" />
          Draw Circle
        </Button>
        
        <Button
          variant={drawMode === 'polygon' ? "secondary" : "default"}
          size="sm"
          onClick={() => startDrawing('polygon')}
          disabled={isDrawing && drawMode !== 'polygon'}
        >
          <Square className="w-4 h-4 mr-2" />
          Draw Polygon
        </Button>

        {isDrawing && (
          <Button
            variant="destructive"
            size="sm"
            onClick={cancelDrawing}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Drawing instructions */}
      {isDrawing && (
        <div className="absolute bottom-4 left-4 right-4 bg-background/90 p-4 rounded-lg">
          <p className="text-sm">
            {drawMode === 'circle' 
              ? drawingPoints.length === 0
                ? "Click to place the center of the circle"
                : "Click to set the radius of the circle"
              : "Click to add polygon points. Double click to complete."}
          </p>
        </div>
      )}
    </div>
  );
};
