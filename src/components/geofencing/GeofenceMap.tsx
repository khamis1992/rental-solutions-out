
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Button } from '@/components/ui/button';
import { MapPin, Circle as CircleIcon, Square } from 'lucide-react';
import { toast } from 'sonner';
import { GeofenceZone, GeofenceType } from '@/types/geofence';

interface GeofenceMapProps {
  mapboxToken: string;
  center: [number, number];
  onGeofenceCreate?: (geofence: GeofenceZone) => void;
}

export const GeofenceMap = ({ mapboxToken, center, onGeofenceCreate }: GeofenceMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [drawMode, setDrawMode] = useState<'none' | GeofenceType>('none');
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const circleLayer = useRef<string | null>(null);
  const circleSource = useRef<string | null>(null);

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
      cleanupLayers();
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, center]);

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!map.current || drawMode === 'none' || !isDrawing) return;

    const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    setDrawingPoints(prev => [...prev, coords]);

    if (drawMode === 'circle') {
      if (drawingPoints.length === 0) {
        // Add center point visualization
        const centerPoint = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coords
          },
          properties: {}
        };

        if (map.current) {
          const sourceId = 'circle-center-source';
          const layerId = 'circle-center-layer';

          // Remove existing layers if they exist
          if (map.current.getLayer(layerId)) {
            map.current.removeLayer(layerId);
          }
          if (map.current.getSource(sourceId)) {
            map.current.removeSource(sourceId);
          }

          // Add new source and layer
          map.current.addSource(sourceId, {
            type: 'geojson',
            data: centerPoint as any
          });

          map.current.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': 6,
              'circle-color': '#FF0000',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFFFFF'
            }
          });

          circleSource.current = sourceId;
          circleLayer.current = layerId;
        }
      } else if (drawingPoints.length === 1) {
        // Calculate circle and complete drawing
        const center = drawingPoints[0];
        const radius = calculateDistance(center, coords);
        
        const geofence: GeofenceZone = {
          type: 'circle',
          center_lat: center[1],
          center_lng: center[0],
          radius: Math.round(radius)
        };

        completeGeofence(geofence);
      }
    }
  };

  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
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

  const cleanupLayers = () => {
    if (!map.current) return;

    // Clean up circle layers
    if (circleLayer.current && map.current.getLayer(circleLayer.current)) {
      map.current.removeLayer(circleLayer.current);
    }
    if (circleSource.current && map.current.getSource(circleSource.current)) {
      map.current.removeSource(circleSource.current);
    }

    circleLayer.current = null;
    circleSource.current = null;
  };

  const completeGeofence = async (geofenceData: Partial<GeofenceZone>) => {
    try {
      if (onGeofenceCreate) {
        onGeofenceCreate(geofenceData as GeofenceZone);
      }
      
      // Reset drawing state
      setDrawingPoints([]);
      setIsDrawing(false);
      setDrawMode('none');
      cleanupLayers();
      
      toast.success('Geofence created successfully');
    } catch (error) {
      console.error('Error creating geofence:', error);
      toast.error('Failed to create geofence');
    }
  };

  const startDrawing = (mode: GeofenceType) => {
    cleanupLayers();
    setDrawMode(mode);
    setIsDrawing(true);
    setDrawingPoints([]);
  };

  const cancelDrawing = () => {
    cleanupLayers();
    setDrawMode('none');
    setIsDrawing(false);
    setDrawingPoints([]);
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
