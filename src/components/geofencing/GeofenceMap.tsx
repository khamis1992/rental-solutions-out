import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Button } from '@/components/ui/button';
import { MapPin, Circle as CircleIcon, Square, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';
import { GeofenceZone, GeofenceType } from '@/types/geofence';

interface GeofenceMapProps {
  mapboxToken: string;
  center: [number, number];
  onGeofenceCreate?: (geofence: GeofenceZone) => void;
  onGeofenceUpdate?: (geofence: GeofenceZone) => void;
  geofences?: GeofenceZone[];
}

export const GeofenceMap = ({ mapboxToken, center, onGeofenceCreate, onGeofenceUpdate, geofences = [] }: GeofenceMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [drawMode, setDrawMode] = useState<'none' | GeofenceType>('none');
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<GeofenceZone | null>(null);
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

    // Add mousemove handler for circle preview
    map.current.on('mousemove', handleMouseMove);

    return () => {
      cleanupLayers();
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, center]);

  const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
    if (!map.current || drawMode !== 'circle' || !isDrawing || drawingPoints.length !== 1) return;

    // Update circle preview
    const center = drawingPoints[0];
    const radius = calculateDistance(center, [e.lngLat.lng, e.lngLat.lat]);
    updateCirclePreview(center, radius);
  };

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

  const updateCirclePreview = (center: [number, number], radius: number) => {
    if (!map.current) return;

    const steps = 64;
    const radiusInKm = radius / 1000;
    const coords = [];
    
    for (let i = 0; i <= steps; i++) {
      const angle = (i * 360) / steps;
      const lat = center[1] + (radius / 111320) * Math.cos(angle * Math.PI / 180);
      const lon = center[0] + (radius / (111320 * Math.cos(center[1] * Math.PI / 180))) * Math.sin(angle * Math.PI / 180);
      coords.push([lon, lat]);
    }

    const circleData = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coords]
      },
      properties: {
        radius: Math.round(radius)
      }
    };

    // Update or create circle preview layer
    const previewSourceId = 'circle-preview-source';
    const previewLayerId = 'circle-preview-layer';
    const radiusLineSourceId = 'radius-line-source';
    const radiusLineLayerId = 'radius-line-layer';

    if (!map.current.getSource(previewSourceId)) {
      map.current.addSource(previewSourceId, {
        type: 'geojson',
        data: circleData as any
      });
    } else {
      (map.current.getSource(previewSourceId) as mapboxgl.GeoJSONSource).setData(circleData as any);
    }

    if (!map.current.getLayer(previewLayerId)) {
      map.current.addLayer({
        id: previewLayerId,
        type: 'fill',
        source: previewSourceId,
        paint: {
          'fill-color': '#FF0000',
          'fill-opacity': 0.2
        }
      });

      map.current.addLayer({
        id: previewLayerId + '-outline',
        type: 'line',
        source: previewSourceId,
        paint: {
          'line-color': '#FF0000',
          'line-width': 2
        }
      });
    }

    // Add or update radius line
    const radiusLineData = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [center, [center[0] + (radius / (111320 * Math.cos(center[1] * Math.PI / 180))), center[1]]]
      },
      properties: {}
    };

    if (!map.current.getSource(radiusLineSourceId)) {
      map.current.addSource(radiusLineSourceId, {
        type: 'geojson',
        data: radiusLineData as any
      });
    } else {
      (map.current.getSource(radiusLineSourceId) as mapboxgl.GeoJSONSource).setData(radiusLineData as any);
    }

    if (!map.current.getLayer(radiusLineLayerId)) {
      map.current.addLayer({
        id: radiusLineLayerId,
        type: 'line',
        source: radiusLineSourceId,
        paint: {
          'line-color': '#FF0000',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });
    }

    // Update radius display
    const radiusInMeters = Math.round(radius);
    const radiusDisplay = document.getElementById('radius-display');
    if (radiusDisplay) {
      radiusDisplay.textContent = `Radius: ${radiusInMeters}m`;
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

    const layersToRemove = [
      'circle-center-layer',
      'circle-preview-layer',
      'circle-preview-layer-outline',
      'radius-line-layer',
      'polygon-preview-layer',
      'polygon-line-layer'
    ];
    
    const sourcesToRemove = [
      'circle-center-source',
      'circle-preview-source',
      'radius-line-source',
      'polygon-preview-source'
    ];

    layersToRemove.forEach(layer => {
      if (map.current?.getLayer(layer)) {
        map.current.removeLayer(layer);
      }
    });

    sourcesToRemove.forEach(source => {
      if (map.current?.getSource(source)) {
        map.current.removeSource(source);
      }
    });

    circleLayer.current = null;
    circleSource.current = null;
    polygonLayer.current = null;
    polygonSource.current = null;
  };

  const completeGeofence = async (geofenceData: GeofenceZone) => {
    try {
      if (editingGeofence) {
        if (onGeofenceUpdate) {
          onGeofenceUpdate({
            ...editingGeofence,
            ...geofenceData
          });
        }
        setEditingGeofence(null);
      } else if (onGeofenceCreate) {
        onGeofenceCreate(geofenceData);
      }
      
      // Reset drawing state
      setDrawingPoints([]);
      setIsDrawing(false);
      setDrawMode('none');
      cleanupLayers();
      
      toast.success(editingGeofence ? 'Geofence updated successfully' : 'Geofence created successfully');
    } catch (error) {
      console.error('Error with geofence:', error);
      toast.error(editingGeofence ? 'Failed to update geofence' : 'Failed to create geofence');
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

  const renderGeofences = () => {
    if (!map.current) return;

    geofences.forEach((geofence, index) => {
      const sourceId = `geofence-${geofence.id}-source`;
      const layerId = `geofence-${geofence.id}-layer`;
      const outlineLayerId = `geofence-${geofence.id}-outline`;

      // Remove existing layers and sources if they exist
      if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
      if (map.current.getLayer(outlineLayerId)) map.current.removeLayer(outlineLayerId);
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

      if (geofence.type === 'circle' && geofence.center_lat && geofence.center_lng && geofence.radius) {
        // Create circle data
        const center: [number, number] = [geofence.center_lng, geofence.center_lat];
        const steps = 64;
        const coords = [];
        for (let i = 0; i <= steps; i++) {
          const angle = (i * 360) / steps;
          const lat = geofence.center_lat + (geofence.radius / 111320) * Math.cos(angle * Math.PI / 180);
          const lon = geofence.center_lng + (geofence.radius / (111320 * Math.cos(geofence.center_lat * Math.PI / 180))) * Math.sin(angle * Math.PI / 180);
          coords.push([lon, lat]);
        }

        const circleData = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coords]
          },
          properties: {
            id: geofence.id,
            name: geofence.name
          }
        };

        map.current.addSource(sourceId, {
          type: 'geojson',
          data: circleData as any
        });

      } else if (geofence.type === 'polygon' && geofence.coordinates) {
        // Create polygon data
        const polygonData = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [geofence.coordinates]
          },
          properties: {
            id: geofence.id,
            name: geofence.name
          }
        };

        map.current.addSource(sourceId, {
          type: 'geojson',
          data: polygonData as any
        });
      }

      // Add fill layer
      map.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': editingGeofence?.id === geofence.id ? '#ffd700' : '#ff0000',
          'fill-opacity': 0.2
        }
      });

      // Add outline layer
      map.current.addLayer({
        id: outlineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': editingGeofence?.id === geofence.id ? '#ffd700' : '#ff0000',
          'line-width': 2
        }
      });

      // Add click handler for editing
      map.current.on('click', layerId, (e) => {
        if (isDrawing) return;
        const feature = e.features?.[0];
        const clickedGeofence = geofences.find(g => g.id === feature?.properties?.id);
        if (clickedGeofence) {
          setEditingGeofence(clickedGeofence);
          setDrawMode(clickedGeofence.type);
          if (clickedGeofence.type === 'circle') {
            setDrawingPoints([[clickedGeofence.center_lng!, clickedGeofence.center_lat!]]);
          } else if (clickedGeofence.type === 'polygon' && clickedGeofence.coordinates) {
            setDrawingPoints(clickedGeofence.coordinates.slice(0, -1));
          }
        }
      });
    });
  };

  useEffect(() => {
    renderGeofences();
  }, [geofences, editingGeofence]);

  const cancelEditing = () => {
    setEditingGeofence(null);
    cancelDrawing();
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
          disabled={(isDrawing && drawMode !== 'circle') || (!!editingGeofence && editingGeofence.type !== 'circle')}
        >
          <CircleIcon className="w-4 h-4 mr-2" />
          {editingGeofence?.type === 'circle' ? 'Edit Circle' : 'Draw Circle'}
        </Button>
        
        <Button
          variant={drawMode === 'polygon' ? "secondary" : "default"}
          size="sm"
          onClick={() => startDrawing('polygon')}
          disabled={(isDrawing && drawMode !== 'polygon') || (!!editingGeofence && editingGeofence.type !== 'polygon')}
        >
          <Square className="w-4 h-4 mr-2" />
          {editingGeofence?.type === 'polygon' ? 'Edit Polygon' : 'Draw Polygon'}
        </Button>

        {(isDrawing || editingGeofence) && (
          <Button
            variant="destructive"
            size="sm"
            onClick={editingGeofence ? cancelEditing : cancelDrawing}
          >
            <X className="w-4 h-4 mr-2" />
            {editingGeofence ? 'Cancel Edit' : 'Cancel'}
          </Button>
        )}
      </div>

      {/* Drawing instructions and radius display */}
      {isDrawing && (
        <div className="absolute bottom-4 left-4 right-4 bg-background/90 p-4 rounded-lg">
          <p className="text-sm">
            {drawMode === 'circle' 
              ? drawingPoints.length === 0
                ? "Click to place the center of the circle"
                : "Click to set the radius of the circle"
              : "Click to add polygon points. Double click to complete."}
          </p>
          {drawMode === 'circle' && drawingPoints.length === 1 && (
            <p id="radius-display" className="text-sm font-medium mt-2">
              Radius: 0m
            </p>
          )}
        </div>
      )}
    </div>
  );
};
