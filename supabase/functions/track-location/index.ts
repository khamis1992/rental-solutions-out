
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
  deviceInfo?: object
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

    const { latitude, longitude, accuracy, deviceInfo } = body

    // Validate location data
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      console.error('Invalid coordinates:', { latitude, longitude })
      return new Response(
        JSON.stringify({ error: 'Invalid location data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
          device_info: deviceInfo,
          connection_status: 'active'
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
