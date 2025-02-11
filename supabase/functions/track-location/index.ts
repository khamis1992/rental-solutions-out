
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  heading?: number
  speed?: number
  battery_level?: number
  network_type?: string
  deviceInfo?: object
}

// Function to check if a point is inside a circle
function isPointInCircle(
  pointLat: number,
  pointLng: number,
  centerLat: number,
  centerLng: number,
  radius: number
): boolean {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (pointLat * Math.PI) / 180;
  const φ2 = (centerLat * Math.PI) / 180;
  const Δφ = ((centerLat - pointLat) * Math.PI) / 180;
  const Δλ = ((centerLng - pointLng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radius;
}

// Function to check if a point is inside a polygon
function isPointInPolygon(
  pointLat: number,
  pointLng: number,
  coordinates: number[][]
): boolean {
  let isInside = false;
  for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
    const xi = coordinates[i][0], yi = coordinates[i][1];
    const xj = coordinates[j][0], yj = coordinates[j][1];

    const intersect = ((yi > pointLng) !== (yj > pointLng))
      && (pointLat < (xj - xi) * (pointLng - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

Deno.serve(async (req) => {
  console.log('Function invoked with method:', req.method)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    )

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Authenticated user:', user.id)

    // Parse and validate request body
    let body: LocationData
    try {
      body = await req.json()
      console.log('Received location data:', body)
    } catch (e) {
      console.error('JSON parse error:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { 
      latitude, 
      longitude, 
      accuracy, 
      altitude,
      heading,
      speed,
      battery_level,
      network_type,
      deviceInfo 
    } = body

    // Validate location data
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      console.error('Invalid coordinates:', { latitude, longitude })
      return new Response(
        JSON.stringify({ error: 'Invalid location data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Try to get address using reverse geocoding
    let address = null
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { 'User-Agent': 'LocationTrackingApp/1.0' } }
      )
      const data = await response.json()
      address = data.display_name
    } catch (error) {
      console.warn('Failed to get address:', error)
    }

    // Insert location data
    const { data, error: insertError } = await supabaseClient
      .from('user_locations')
      .insert([
        {
          user_id: user.id,
          latitude,
          longitude,
          accuracy,
          altitude,
          heading,
          speed,
          battery_level,
          network_type,
          address,
          device_info: deviceInfo,
          connection_status: 'active',
          last_updated: new Date().toISOString()
        }
      ])
      .select()

    if (insertError) {
      console.error('Database error:', insertError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save location', 
          details: insertError.message,
          code: insertError.code 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all geofence zones
    const { data: zones, error: zonesError } = await supabaseClient
      .from('geofence_zones')
      .select('*')

    if (zonesError) {
      console.error('Error fetching geofence zones:', zonesError)
    } else {
      // Get user's last known location
      const { data: lastLocation } = await supabaseClient
        .from('user_locations')
        .select('latitude, longitude')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2)

      // Process each zone
      for (const zone of zones) {
        let wasInZone = false
        let isInZone = false

        // Check if user was in zone based on last location
        if (lastLocation && lastLocation.length > 1) {
          const prevLocation = lastLocation[1]
          wasInZone = zone.type === 'circle'
            ? isPointInCircle(
                prevLocation.latitude,
                prevLocation.longitude,
                zone.center_lat!,
                zone.center_lng!,
                zone.radius!
              )
            : isPointInPolygon(
                prevLocation.latitude,
                prevLocation.longitude,
                zone.coordinates!
              )
        }

        // Check if user is currently in zone
        isInZone = zone.type === 'circle'
          ? isPointInCircle(
              latitude,
              longitude,
              zone.center_lat!,
              zone.center_lng!,
              zone.radius!
            )
          : isPointInPolygon(
              latitude,
              longitude,
              zone.coordinates!
            )

        // Determine if an event needs to be recorded
        if (isInZone !== wasInZone) {
          const eventType = isInZone ? 'enter' : 'exit'
          const { error: eventError } = await supabaseClient
            .from('geofence_events')
            .insert({
              user_id: user.id,
              zone_id: zone.id,
              event_type: eventType,
              location_lat: latitude,
              location_lng: longitude
            })

          if (eventError) {
            console.error('Error recording geofence event:', eventError)
          } else {
            console.log(`Recorded ${eventType} event for zone ${zone.id}`)
          }
        }
      }
    }

    console.log('Location saved successfully')
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
