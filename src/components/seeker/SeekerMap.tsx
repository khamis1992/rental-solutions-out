
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SeekerTarget } from '@/types/seeker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SeekerMapProps {
  targets?: SeekerTarget[];
}

export function SeekerMap({ targets }: SeekerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  const { data: mapboxToken } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      return data.token;
    }
  });

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [51.5074, 25.2867], // Default to Doha coordinates
      zoom: 12
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !targets) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    targets.forEach(target => {
      if (target.last_location_lat && target.last_location_lng) {
        const el = document.createElement('div');
        el.className = 'seeker-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.backgroundColor = target.status === 'active' ? '#22c55e' : '#94a3b8';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.1)';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([target.last_location_lng, target.last_location_lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <div class="font-semibold">${target.target_name}</div>
                  <div class="text-sm text-gray-500">Last seen: ${new Date(target.last_seen_at || '').toLocaleString()}</div>
                  <div class="text-sm text-gray-500">Status: ${target.status}</div>
                  ${target.battery_level ? `<div class="text-sm text-gray-500">Battery: ${target.battery_level}%</div>` : ''}
                </div>
              `)
          )
          .addTo(map.current!);

        markersRef.current[target.id] = marker;
      }
    });

    // Fit bounds to show all markers
    if (targets.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      targets.forEach(target => {
        if (target.last_location_lat && target.last_location_lng) {
          bounds.extend([target.last_location_lng, target.last_location_lat]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [targets]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
