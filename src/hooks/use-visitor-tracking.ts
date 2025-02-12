
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Get or create session ID from localStorage
const getSessionId = () => {
  let sessionId = localStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
};

// Get UTM parameters from URL
const getUTMParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utmSource: urlParams.get('utm_source') || undefined,
    utmMedium: urlParams.get('utm_medium') || undefined,
    utmCampaign: urlParams.get('utm_campaign') || undefined
  };
};

export const useVisitorTracking = () => {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();
        const { utmSource, utmMedium, utmCampaign } = getUTMParams();

        const { error } = await supabase.functions.invoke('track-visitor', {
          body: {
            sessionId,
            pageVisited: window.location.pathname,
            referrer: document.referrer,
            utmSource,
            utmMedium,
            utmCampaign
          }
        });

        if (error) {
          console.error('Error tracking visitor:', error);
        }
      } catch (error) {
        console.error('Failed to track visitor:', error);
      }
    };

    trackPageView();
  }, []);
};
