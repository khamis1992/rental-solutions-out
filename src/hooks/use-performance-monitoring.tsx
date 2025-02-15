
import { useRef, useEffect } from 'react';
import { performanceMetrics } from "@/services/performanceMonitoring";
import { toast } from "sonner";
import type { ExtendedPerformance } from "@/services/performance/types";
import { 
  CPU_THRESHOLD, 
  MEMORY_THRESHOLD,
  DEBOUNCE_DELAY
} from "@/services/performance/constants";

// Define monitoring intervals as constants
const MONITOR_CPU_INTERVAL = 10000;    // Every 10 seconds
const MONITOR_MEMORY_INTERVAL = 15000; // Every 15 seconds
const MONITOR_DISK_INTERVAL = 60000;   // Every minute

export const usePerformanceMonitoring = () => {
  const intervals = useRef<Array<NodeJS.Timeout>>([]);
  const lastUpdate = useRef<number>(0);

  const measureCPUUsage = async (): Promise<number> => {
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
  };

  // Debounced monitor update to prevent too frequent updates
  const debouncedMonitorUpdate = (callback: () => Promise<void>) => {
    const now = Date.now();
    if (now - lastUpdate.current >= DEBOUNCE_DELAY) {
      lastUpdate.current = now;
      void callback();
    }
  };

  const monitorPerformance = async () => {
    try {
      // Monitor CPU with debouncing
      const monitorCPU = async () => {
        debouncedMonitorUpdate(async () => {
          const cpuUsage = await measureCPUUsage();
          if (cpuUsage > CPU_THRESHOLD) {
            toast.warning("High CPU Usage", {
              description: `Current CPU utilization is ${cpuUsage.toFixed(1)}%`
            });
          }
          await performanceMetrics.trackCPUUtilization(cpuUsage);
        });
      };

      // Monitor Memory with debouncing
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
            await performanceMetrics.trackMemoryUsage();
          }
        });
      };

      // Monitor Disk with debouncing
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
            await performanceMetrics.trackDiskIO();
          }
        });
      };

      // Set up monitoring intervals with cleanup
      intervals.current = [
        setInterval(() => void monitorCPU(), MONITOR_CPU_INTERVAL),
        setInterval(() => void monitorMemory(), MONITOR_MEMORY_INTERVAL),
        setInterval(() => void monitorDisk(), MONITOR_DISK_INTERVAL)
      ];

    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  };

  useEffect(() => {
    void monitorPerformance();
    return () => {
      intervals.current.forEach(clearInterval);
      intervals.current = [];
    };
  }, []);
};
