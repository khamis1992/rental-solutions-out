import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { parse as parseUA } from 'https://esm.sh/ua-parser-js@1.0.37'
import { createHash } from 'https://deno.land/std@0.194.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface VisitorData {
  sessionId: string;
  pageVisited: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// Function to anonymize IP address (keep first two octets, hash the rest)
function anonymizeIP(ip: string): string {
  const parts = ip.split('.');
  if (parts.length !== 4) return createHash('sha256').update(ip).toString();
  
  const anonymizedIP = `${parts[0]}.${parts[1]}.*.*`;
  return createHash('sha256').update(anonymizedIP).toString();
}

// Function to parse user agent
function parseUserAgent(userAgent: string) {
  const ua = parseUA(userAgent);
  return {
    browser: `${ua.browser.name || ''} ${ua.browser.version || ''}`.trim(),
    os: `${ua.os.name || ''} ${ua.os.version || ''}`.trim(),
    device: ua.device.type || 'desktop'
  };
}

// Function to get country and city from IP (mock implementation)
async function getGeoLocation(ip: string) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    return {
      country: data.country || null,
      city: data.city || null
    };
  } catch (error) {
    console.error('Error getting geolocation:', error);
    return { country: null, city: null };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    // Parse request body
    const visitorData: VisitorData = await req.json();
    
    // Get user agent
    const userAgent = req.headers.get('user-agent') || '';
    const { browser, os, device } = parseUserAgent(userAgent);
    
    // Get geolocation
    const { country, city } = await getGeoLocation(clientIP);
    
    // Insert visitor data
    const { data, error } = await supabaseClient
      .from('visitor_analytics')
      .insert({
        session_id: visitorData.sessionId,
        ip_hash: anonymizeIP(clientIP),
        user_agent: userAgent,
        page_visited: visitorData.pageVisited,
        referrer: visitorData.referrer,
        utm_source: visitorData.utmSource,
        utm_medium: visitorData.utmMedium,
        utm_campaign: visitorData.utmCampaign,
        country,
        city,
        browser,
        os,
        device_type: device,
        visited_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting visitor data:', error);
      throw error;
    }

    console.log('Successfully tracked visitor:', {
      sessionId: visitorData.sessionId,
      page: visitorData.pageVisited,
      browser,
      os,
      device
    });

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error processing visitor tracking:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
