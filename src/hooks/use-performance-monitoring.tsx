
import { useRef, useEffect, useState } from 'react';
import { performanceMetrics } from "@/services/performanceMonitoring";
import { toast } from "sonner";
import type { ExtendedPerformance } from "@/services/performance/types";
import { 
  CPU_THRESHOLD, 
  MEMORY_THRESHOLD,
  DEBOUNCE_DELAY
} from "@/services/performance/constants";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Define monitoring intervals based on actual needs
// CPU is checked less frequently as it's less critical for web apps
const MONITOR_CPU_INTERVAL = 30000;     // Every 30 seconds
// Memory is checked more frequently as it's critical for app performance
const MONITOR_MEMORY_INTERVAL = 10000;  // Every 10 seconds 
// Disk is checked rarely as it changes slowly
const MONITOR_DISK_INTERVAL = 300000;   // Every 5 minutes

// Maximum number of retries for failed operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const MonitoringComponent = () => {
  const intervals = useRef<Array<NodeJS.Timeout>>([]);
  const lastUpdate = useRef<number>(0);
  const [hasError, setHasError] = useState(false);
  const retryCount = useRef(0);

  const measureCPUUsage = async (): Promise<number> => {
    try {
      const performance = window.performance as ExtendedPerformance;
      if (!performance?.memory) return 0;

      const startTime = performance.now();
      const startUsage = performance.memory.usedJSHeapSize;
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endTime = performance.now();
      const endUsage = performance.memory.usedJSHeapSize;
      
      const duration = endTime - startTime;
      const memoryDiff = endUsage - startUsage;
      const cpuUsage = (memoryDiff / duration) * 100;
      
      return Math.min(Math.max(cpuUsage, 0), 100);
    } catch (error) {
      console.error('Error measuring CPU usage:', error);
      return 0;
    }
  };

  // Debounced monitor update to prevent too frequent updates
  const debouncedMonitorUpdate = (callback: () => Promise<void>) => {
    const now = Date.now();
    if (now - lastUpdate.current >= DEBOUNCE_DELAY) {
      lastUpdate.current = now;
      void callback();
    }
  };

  const retryOperation = async <T,>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      console.error(errorMessage, error);
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryOperation(operation, errorMessage);
      }
      setHasError(true);
      return null;
    }
  };

  const monitorPerformance = async () => {
    try {
      // Monitor Memory with debouncing (highest priority)
      const monitorMemory = async () => {
        debouncedMonitorUpdate(async () => {
          const performance = window.performance as ExtendedPerformance;
          if (performance?.memory) {
            const usedMemory = performance.memory.usedJSHeapSize;
            const totalMemory = performance.memory.totalJSHeapSize;
            const memoryUsage = (usedMemory / totalMemory) * 100;

            if (memoryUsage > MEMORY_THRESHOLD) {
              toast.warning("High Memory Usage", {
                description: `Memory utilization is at ${memoryUsage.toFixed(1)}%`
              });
            }
            await retryOperation(
              () => performanceMetrics.trackMemoryUsage(),
              'Failed to track memory usage'
            );
          }
        });
      };

      // Monitor CPU with debouncing (medium priority)
      const monitorCPU = async () => {
        debouncedMonitorUpdate(async () => {
          const cpuUsage = await measureCPUUsage();
          if (cpuUsage > CPU_THRESHOLD) {
            toast.warning("High CPU Usage", {
              description: `Current CPU utilization is ${cpuUsage.toFixed(1)}%`
            });
          }
          await retryOperation(
            () => performanceMetrics.trackCPUUtilization(cpuUsage),
            'Failed to track CPU utilization'
          );
        });
      };

      // Monitor Disk with debouncing (lowest priority)
      const monitorDisk = async () => {
        debouncedMonitorUpdate(async () => {
          if ('storage' in navigator && 'estimate' in navigator.storage) {
            const { quota = 0, usage = 0 } = await navigator.storage.estimate();
            const usagePercentage = (usage / quota) * 100;

            if (usagePercentage > 90) {
              toast.warning("High Disk Usage", {
                description: `Storage utilization is at ${usagePercentage.toFixed(1)}%`
              });
            }
            await retryOperation(
              () => performanceMetrics.trackDiskIO(),
              'Failed to track disk I/O'
            );
          }
        });
      };

      // Set up monitoring intervals with cleanup
      intervals.current = [
        setInterval(() => void monitorMemory(), MONITOR_MEMORY_INTERVAL),
        setInterval(() => void monitorCPU(), MONITOR_CPU_INTERVAL),
        setInterval(() => void monitorDisk(), MONITOR_DISK_INTERVAL)
      ];

    } catch (error) {
      console.error('Performance monitoring error:', error);
      setHasError(true);
    }
  };

  useEffect(() => {
    if (!hasError) {
      void monitorPerformance();
    }
    return () => {
      intervals.current.forEach(clearInterval);
      intervals.current = [];
    };
  }, [hasError]);

  if (hasError) {
    return (
      <div className="text-sm text-red-500">
        Performance monitoring temporarily unavailable. Retrying...
      </div>
    );
  }

  return null;
};

export const usePerformanceMonitoring = () => {
  return (
    <ErrorBoundary>
      <MonitoringComponent />
    </ErrorBoundary>
  );
};
