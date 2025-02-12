
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface PerformanceMetrics {
  timeToFirstByte?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
}

interface EngagementMetrics {
  timeOnPage: number;
  scrollDepth: number;
  lastInteraction: number;
}

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
const getUTMParams = (): UtmParams => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utmSource: urlParams.get('utm_source') || undefined,
    utmMedium: urlParams.get('utm_medium') || undefined,
    utmCampaign: urlParams.get('utm_campaign') || undefined
  };
};

// Get performance metrics using Performance API
const getPerformanceMetrics = (): PerformanceMetrics => {
  if (!window.performance || !window.performance.timing) {
    return {};
  }

  const timing = window.performance.timing;
  const metrics: PerformanceMetrics = {
    timeToFirstByte: timing.responseStart - timing.navigationStart,
    firstContentfulPaint: 0, // Will be populated via PerformanceObserver
  };

  // Observe First Contentful Paint
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
          observer.disconnect();
        }
      }
    });
    observer.observe({ entryTypes: ['paint'] });
  }

  return metrics;
};

// Track user engagement
const initEngagementTracking = (): EngagementMetrics => {
  const engagement: EngagementMetrics = {
    timeOnPage: 0,
    scrollDepth: 0,
    lastInteraction: Date.now(),
  };

  // Track scroll depth
  const trackScrollDepth = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition = window.scrollY;
    engagement.scrollDepth = Math.round((scrollPosition / docHeight) * 100);
  };

  // Track time on page and last interaction
  const updateEngagement = () => {
    engagement.lastInteraction = Date.now();
  };

  window.addEventListener('scroll', () => {
    trackScrollDepth();
    updateEngagement();
  });

  window.addEventListener('mousemove', updateEngagement);
  window.addEventListener('keydown', updateEngagement);
  window.addEventListener('click', updateEngagement);

  return engagement;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const useVisitorTracking = () => {
  useEffect(() => {
    let retryCount = 0;
    let engagement: EngagementMetrics;

    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();
        const { utmSource, utmMedium, utmCampaign } = getUTMParams();
        const performanceMetrics = getPerformanceMetrics();
        engagement = initEngagementTracking();

        const { error } = await supabase.functions.invoke('track-visitor', {
          body: {
            sessionId,
            pageVisited: window.location.pathname,
            referrer: document.referrer,
            utmSource,
            utmMedium,
            utmCampaign,
            performanceMetrics,
            engagementMetrics: engagement
          }
        });

        if (error) {
          console.error('Error tracking visitor:', error);
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(trackPageView, RETRY_DELAY * retryCount);
          }
        }
      } catch (error) {
        console.error('Failed to track visitor:', error);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(trackPageView, RETRY_DELAY * retryCount);
        }
      }
    };

    // Start tracking
    trackPageView();

    // Cleanup function
    return () => {
      // Send final engagement metrics before unmounting
      if (engagement) {
        supabase.functions.invoke('track-visitor', {
          body: {
            sessionId: getSessionId(),
            pageVisited: window.location.pathname,
            engagementMetrics: engagement,
            isPageExit: true
          }
        }).catch(console.error);
      }
    };
  }, []);
};
