import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetric {
  componentName: string;
  renderTime: number;
  timestamp: Date;
  mountTime?: number;
  unmountTime?: number;
}

interface PerformanceData {
  metrics: PerformanceMetric[];
  averageRenderTime: number;
  totalRenders: number;
  slowRenders: number; // renders > 16ms (60fps threshold)
}

const performanceData: Map<string, PerformanceData> = new Map();

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // Measure render time
  const measureRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    if (!performanceData.has(componentName)) {
      performanceData.set(componentName, {
        metrics: [],
        averageRenderTime: 0,
        totalRenders: 0,
        slowRenders: 0
      });
    }

    const data = performanceData.get(componentName)!;
    const metric: PerformanceMetric = {
      componentName,
      renderTime,
      timestamp: new Date()
    };

    data.metrics.push(metric);
    data.totalRenders++;
    
    if (renderTime > 16) { // 60fps threshold
      data.slowRenders++;
    }

    // Calculate new average
    data.averageRenderTime = data.metrics.reduce((sum, m) => sum + m.renderTime, 0) / data.metrics.length;

    // Keep only last 100 metrics
    if (data.metrics.length > 100) {
      data.metrics = data.metrics.slice(-100);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const color = renderTime > 16 ? 'color: #f59e0b' : 'color: #10b981';
      console.log(
        `%c[Performance] ${componentName}: ${renderTime.toFixed(2)}ms`,
        color
      );
    }

    return renderTime;
  }, [componentName]);

  // Start measuring render time
  useEffect(() => {
    renderStartTime.current = performance.now();
    mountTime.current = performance.now();
    renderCount.current++;

    // Measure after render
    const timeoutId = setTimeout(measureRender, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  });

  // Measure unmount time
  useEffect(() => {
    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `%c[Performance] ${componentName} unmounted after ${totalLifetime.toFixed(2)}ms (${renderCount.current} renders)`,
          'color: #ef4444'
        );
      }
    };
  }, [componentName]);

  // Get performance data for this component
  const getPerformanceData = useCallback((): PerformanceData | null => {
    return performanceData.get(componentName) || null;
  }, [componentName]);

  // Get all performance data
  const getAllPerformanceData = useCallback((): Map<string, PerformanceData> => {
    return new Map(performanceData);
  }, []);

  // Clear performance data for this component
  const clearPerformanceData = useCallback(() => {
    performanceData.delete(componentName);
  }, [componentName]);

  // Clear all performance data
  const clearAllPerformanceData = useCallback(() => {
    performanceData.clear();
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const data = performanceData.get(componentName);
    if (!data) return null;

    return {
      componentName,
      totalRenders: data.totalRenders,
      averageRenderTime: data.averageRenderTime,
      slowRenders: data.slowRenders,
      slowRenderPercentage: (data.slowRenders / data.totalRenders) * 100,
      lastRenderTime: data.metrics[data.metrics.length - 1]?.renderTime || 0
    };
  }, [componentName]);

  return {
    getPerformanceData,
    getAllPerformanceData,
    clearPerformanceData,
    clearAllPerformanceData,
    getPerformanceSummary,
    // Utility functions
    measureRender,
    renderCount: renderCount.current
  };
};

// Global performance monitoring utilities
export const PerformanceMonitor = {
  // Get all performance data
  getAllData: (): Map<string, PerformanceData> => {
    return new Map(performanceData);
  },

  // Clear all data
  clearAll: (): void => {
    performanceData.clear();
  },

  // Get summary for all components
  getSummary: (): Array<{
    componentName: string;
    totalRenders: number;
    averageRenderTime: number;
    slowRenders: number;
    slowRenderPercentage: number;
  }> => {
    return Array.from(performanceData.entries()).map(([name, data]) => ({
      componentName: name,
      totalRenders: data.totalRenders,
      averageRenderTime: data.averageRenderTime,
      slowRenders: data.slowRenders,
      slowRenderPercentage: (data.slowRenders / data.totalRenders) * 100
    }));
  },

  // Export performance data as JSON
  exportData: (): string => {
    const exportData = Array.from(performanceData.entries()).map(([name, data]) => ({
      componentName: name,
      ...data,
      metrics: data.metrics.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString()
      }))
    }));
    return JSON.stringify(exportData, null, 2);
  },

  // Import performance data
  importData: (jsonData: string): void => {
    try {
      const data = JSON.parse(jsonData);
      performanceData.clear();
      data.forEach((item: any) => {
        performanceData.set(item.componentName, {
          ...item,
          metrics: item.metrics.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        });
      });
    } catch (error) {
      console.error('Failed to import performance data:', error);
    }
  }
};

export default usePerformanceMonitor;

