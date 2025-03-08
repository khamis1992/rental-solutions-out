
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetrics {
  queryCount: number;
  avgQueryTime: number;
  maxQueryTime: number;
  errorCount: number;
  lastUpdated: Date;
  dataTransferred: number;
  slowestEndpoint?: string;
  statusCodes: Record<string, number>;
}

export interface PerformanceThresholds {
  slowQueryTime: number; // in ms
  criticalQueryTime: number; // in ms
  highErrorRate: number; // percentage
  criticalErrorRate: number; // percentage
}

export const usePerformanceMonitoring = (options: {
  refreshInterval?: number;
  thresholds?: Partial<PerformanceThresholds>;
  enableAlerts?: boolean;
} = {}) => {
  const {
    refreshInterval = 60000, // default to 1 minute
    thresholds = {},
    enableAlerts = false
  } = options;

  const defaultThresholds: PerformanceThresholds = {
    slowQueryTime: 1000, // 1 second
    criticalQueryTime: 3000, // 3 seconds
    highErrorRate: 5, // 5%
    criticalErrorRate: 15, // 15%
    ...thresholds
  };

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    queryCount: 0,
    avgQueryTime: 0,
    maxQueryTime: 0,
    errorCount: 0,
    lastUpdated: new Date(),
    dataTransferred: 0,
    statusCodes: {}
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPerformanceMetrics = async () => {
    try {
      // Fetch performance data from the system
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const latestData = data[0];
        
        setMetrics({
          queryCount: latestData.query_count || 0,
          avgQueryTime: latestData.avg_query_time || 0,
          maxQueryTime: latestData.max_query_time || 0,
          errorCount: latestData.error_count || 0,
          lastUpdated: new Date(latestData.timestamp),
          dataTransferred: latestData.data_transferred || 0,
          slowestEndpoint: latestData.slowest_endpoint,
          statusCodes: latestData.status_codes || {}
        });
      }
    } catch (err) {
      console.error('Error fetching performance metrics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch performance metrics'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPerformanceMetrics();

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchPerformanceMetrics, refreshInterval);

    // Subscribe to performance alerts
    const performanceChannel = supabase
      .channel('performance-alerts')
      .on('broadcast', { event: 'performance_alert' }, (payload) => {
        if (enableAlerts) {
          console.warn('Performance alert:', payload);
          // You can implement toast or notification here
        }
        
        // Fetch the latest metrics when receiving an alert
        fetchPerformanceMetrics();
      })
      .subscribe();

    // Cleanup
    return () => {
      clearInterval(intervalId);
      performanceChannel.unsubscribe();
    };
  }, [refreshInterval, enableAlerts]);

  // Analysis of current metrics
  const analysis = {
    hasSlowQueries: metrics.avgQueryTime > defaultThresholds.slowQueryTime,
    hasCriticalQueries: metrics.maxQueryTime > defaultThresholds.criticalQueryTime,
    errorRate: metrics.queryCount > 0 ? (metrics.errorCount / metrics.queryCount) * 100 : 0,
    hasHighErrorRate: metrics.queryCount > 0 && 
      ((metrics.errorCount / metrics.queryCount) * 100) > defaultThresholds.highErrorRate,
    hasCriticalErrorRate: metrics.queryCount > 0 && 
      ((metrics.errorCount / metrics.queryCount) * 100) > defaultThresholds.criticalErrorRate,
    successRate: metrics.queryCount > 0 ? 
      100 - ((metrics.errorCount / metrics.queryCount) * 100) : 100
  };

  const refreshMetrics = () => {
    setIsLoading(true);
    fetchPerformanceMetrics();
  };

  return {
    metrics,
    isLoading,
    error,
    analysis,
    refreshMetrics
  };
};
