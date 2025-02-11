
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
  const polygonLayer = useRef<string | null>(null);
  const polygonSource = useRef<string | null>(null);

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
    map.current.on('dblclick', handleDoubleClick);

    return () => {
      cleanupLayers();
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, center]);

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!map.current || drawMode === 'none' || !isDrawing) return;
    e.preventDefault();

    const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    setDrawingPoints(prev => [...prev, coords]);

    if (drawMode === 'circle') {
      handleCircleDrawing(coords);
    } else if (drawMode === 'polygon') {
      updatePolygonPreview([...drawingPoints, coords]);
    }
  };

  const handleCircleDrawing = (coords: [number, number]) => {
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

        if (map.current.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }

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
        name: 'New Geofence', // Required by type, will be overwritten by form data
        type: 'circle',
        center_lat: center[1],
        center_lng: center[0],
        radius: Math.round(radius)
      };

      completeGeofence(geofence);
    }
  };

  const handleDoubleClick = (e: mapboxgl.MapMouseEvent) => {
    if (!map.current || drawMode !== 'polygon' || !isDrawing) return;
    e.preventDefault();

    if (drawingPoints.length >= 3) {
      // Close the polygon by adding the first point again
      const closedPolygon = [...drawingPoints, drawingPoints[0]];
      
      const geofence: GeofenceZone = {
        name: 'New Geofence', // Required by type, will be overwritten by form data
        type: 'polygon',
        coordinates: closedPolygon
      };

      completeGeofence(geofence);
    } else {
      toast.error('Please add at least 3 points to create a polygon');
    }
  };

  const updatePolygonPreview = (points: [number, number][]) => {
    if (!map.current) return;

    const sourceId = 'polygon-preview-source';
    const layerId = 'polygon-preview-layer';
    const lineLayerId = 'polygon-line-layer';

    // Create polygon data
    const polygonData = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [points.length > 2 ? [...points, points[0]] : points]
      },
      properties: {}
    };

    // Add or update source
    if (!map.current.getSource(sourceId)) {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: polygonData as any
      });
    } else {
      (map.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(polygonData as any);
    }

    // Add or update fill layer
    if (!map.current.getLayer(layerId)) {
      map.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#ff0000',
          'fill-opacity': 0.2
        }
      });
    }

    // Add or update line layer
    if (!map.current.getLayer(lineLayerId)) {
      map.current.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#ff0000',
          'line-width': 2
        }
      });
    }

    polygonSource.current = sourceId;
    polygonLayer.current = layerId;
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

    // Clean up polygon layers
    if (polygonLayer.current && map.current.getLayer(polygonLayer.current)) {
      map.current.removeLayer(polygonLayer.current);
      map.current.removeLayer('polygon-line-layer');
    }
    if (polygonSource.current && map.current.getSource(polygonSource.current)) {
      map.current.removeSource(polygonSource.current);
    }

    circleLayer.current = null;
    circleSource.current = null;
    polygonLayer.current = null;
    polygonSource.current = null;
  };

  const completeGeofence = async (geofenceData: GeofenceZone) => {
    try {
      if (onGeofenceCreate) {
        onGeofenceCreate(geofenceData);
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
