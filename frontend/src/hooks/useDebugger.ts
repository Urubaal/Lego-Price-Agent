import { useEffect, useRef, useCallback, useState } from 'react';

interface DebugConfig {
  enabled: boolean;
  logProps: boolean;
  logState: boolean;
  logEffects: boolean;
  logRenders: boolean;
  logLifecycle: boolean;
  breakOnError: boolean;
  showInConsole: boolean;
}

interface DebugInfo {
  componentName: string;
  props: any;
  state: any;
  renderCount: number;
  mountTime: Date;
  lastRenderTime: Date;
  effects: string[];
}

const defaultConfig: DebugConfig = {
  enabled: process.env.NODE_ENV === 'development',
  logProps: true,
  logState: true,
  logEffects: true,
  logRenders: true,
  logLifecycle: true,
  breakOnError: false,
  showInConsole: true
};

// Global debug state
const debugState = {
  enabled: defaultConfig.enabled,
  breakpoints: new Set<string>(),
  watchedComponents: new Set<string>(),
  logs: [] as Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'debug';
    component: string;
    message: string;
    data?: any;
  }>
};

export const useDebugger = (
  componentName: string,
  config: Partial<DebugConfig> = {}
) => {
  const mergedConfig = { ...defaultConfig, ...config };
  const debugInfo = useRef<DebugInfo>({
    componentName,
    props: {},
    state: {},
    renderCount: 0,
    mountTime: new Date(),
    lastRenderTime: new Date(),
    effects: []
  });
  
  const [isWatched, setIsWatched] = useState(debugState.watchedComponents.has(componentName));
  const [hasBreakpoint, setHasBreakpoint] = useState(debugState.breakpoints.has(componentName));

  // Log function
  const log = useCallback((
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: any
  ) => {
    if (!mergedConfig.enabled) return;

    const logEntry = {
      timestamp: new Date(),
      level,
      component: componentName,
      message,
      data
    };

    debugState.logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (debugState.logs.length > 1000) {
      debugState.logs = debugState.logs.slice(-1000);
    }

    if (mergedConfig.showInConsole) {
      const colors = {
        info: 'color: #3b82f6',
        warn: 'color: #f59e0b',
        error: 'color: #ef4444',
        debug: 'color: #10b981'
      };

      console.group(`%c[${componentName}] ${message}`, colors[level]);
      if (data) {
        console.log('Data:', data);
      }
      console.log('Timestamp:', logEntry.timestamp.toISOString());
      console.groupEnd();
    }

    // Check for breakpoint
    if (mergedConfig.breakOnError && level === 'error' && hasBreakpoint) {
      debugger;
    }
  }, [componentName, mergedConfig, hasBreakpoint]);

  // Log props changes
  const logProps = useCallback((props: any) => {
    if (!mergedConfig.enabled || !mergedConfig.logProps) return;
    
    debugInfo.current.props = props;
    log('debug', 'Props updated', props);
  }, [mergedConfig, log]);

  // Log state changes
  const logState = useCallback((state: any) => {
    if (!mergedConfig.enabled || !mergedConfig.logState) return;
    
    debugInfo.current.state = state;
    log('debug', 'State updated', state);
  }, [mergedConfig, log]);

  // Log effect
  const logEffect = useCallback((effectName: string, dependencies?: any[]) => {
    if (!mergedConfig.enabled || !mergedConfig.logEffects) return;
    
    debugInfo.current.effects.push(effectName);
    log('debug', `Effect: ${effectName}`, { dependencies });
  }, [mergedConfig, log]);

  // Log render
  const logRender = useCallback(() => {
    if (!mergedConfig.enabled || !mergedConfig.logRenders) return;
    
    debugInfo.current.renderCount++;
    debugInfo.current.lastRenderTime = new Date();
    log('debug', `Render #${debugInfo.current.renderCount}`);
  }, [mergedConfig, log]);

  // Log lifecycle
  const logLifecycle = useCallback((event: string, data?: any) => {
    if (!mergedConfig.enabled || !mergedConfig.logLifecycle) return;
    
    log('info', `Lifecycle: ${event}`, data);
  }, [mergedConfig, log]);

  // Watch component
  const watchComponent = useCallback(() => {
    debugState.watchedComponents.add(componentName);
    setIsWatched(true);
    log('info', 'Component added to watchlist');
  }, [componentName, log]);

  // Unwatch component
  const unwatchComponent = useCallback(() => {
    debugState.watchedComponents.delete(componentName);
    setIsWatched(false);
    log('info', 'Component removed from watchlist');
  }, [componentName, log]);

  // Add breakpoint
  const addBreakpoint = useCallback(() => {
    debugState.breakpoints.add(componentName);
    setHasBreakpoint(true);
    log('info', 'Breakpoint added');
  }, [componentName, log]);

  // Remove breakpoint
  const removeBreakpoint = useCallback(() => {
    debugState.breakpoints.delete(componentName);
    setHasBreakpoint(false);
    log('info', 'Breakpoint removed');
  }, [componentName, log]);

  // Get debug info
  const getDebugInfo = useCallback(() => {
    return { ...debugInfo.current };
  }, []);

  // Get all debug logs
  const getDebugLogs = useCallback(() => {
    return [...debugState.logs];
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    debugState.logs = [];
    log('info', 'Debug logs cleared');
  }, [log]);

  // Export debug data
  const exportDebugData = useCallback(() => {
    const exportData = {
      componentInfo: debugInfo.current,
      logs: debugState.logs.map(log => ({
        ...log,
        timestamp: log.timestamp.toISOString()
      })),
      config: mergedConfig,
      globalState: {
        enabled: debugState.enabled,
        breakpoints: Array.from(debugState.breakpoints),
        watchedComponents: Array.from(debugState.watchedComponents)
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName}-debug-data.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    log('info', 'Debug data exported');
  }, [componentName, mergedConfig, log]);

  // Component mount
  useEffect(() => {
    if (mergedConfig.enabled && mergedConfig.logLifecycle) {
      logLifecycle('Component mounted');
    }
  }, [mergedConfig, logLifecycle]);

  // Component unmount
  useEffect(() => {
    return () => {
      if (mergedConfig.enabled && mergedConfig.logLifecycle) {
        logLifecycle('Component unmounted', {
          totalRenders: debugInfo.current.renderCount,
          lifetime: Date.now() - debugInfo.current.mountTime.getTime()
        });
      }
    };
  }, [mergedConfig, logLifecycle]);

  // Watch for global debug state changes
  useEffect(() => {
    const checkWatched = () => setIsWatched(debugState.watchedComponents.has(componentName));
    const checkBreakpoint = () => setHasBreakpoint(debugState.breakpoints.has(componentName));

    // Check initially
    checkWatched();
    checkBreakpoint();

    // Set up interval to check for changes
    const interval = setInterval(() => {
      checkWatched();
      checkBreakpoint();
    }, 1000);

    return () => clearInterval(interval);
  }, [componentName]);

  return {
    // Logging functions
    log,
    logProps,
    logState,
    logEffect,
    logRender,
    logLifecycle,
    
    // Watch functions
    watchComponent,
    unwatchComponent,
    isWatched,
    
    // Breakpoint functions
    addBreakpoint,
    removeBreakpoint,
    hasBreakpoint,
    
    // Info functions
    getDebugInfo,
    getDebugLogs,
    clearLogs,
    exportDebugData,
    
    // Config
    config: mergedConfig,
    
    // Debug info
    debugInfo: debugInfo.current
  };
};

// Global debugger utilities
export const Debugger = {
  // Enable/disable global debugging
  setEnabled: (enabled: boolean) => {
    debugState.enabled = enabled;
    console.log(`%c[Debugger] ${enabled ? 'Enabled' : 'Disabled'}`, 'color: #3b82f6');
  },

  // Get all watched components
  getWatchedComponents: () => Array.from(debugState.watchedComponents),

  // Get all breakpoints
  getBreakpoints: () => Array.from(debugState.breakpoints),

  // Get all logs
  getLogs: () => [...debugState.logs],

  // Clear all logs
  clearLogs: () => {
    debugState.logs = [];
    console.log('%c[Debugger] All logs cleared', 'color: #3b82f6');
  },

  // Export all debug data
  exportAllData: () => {
    const exportData = {
      logs: debugState.logs.map(log => ({
        ...log,
        timestamp: log.timestamp.toISOString()
      })),
      watchedComponents: Array.from(debugState.watchedComponents),
      breakpoints: Array.from(debugState.breakpoints),
      enabled: debugState.enabled
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-debug-data.json';
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('%c[Debugger] All debug data exported', 'color: #3b82f6');
  },

  // Set breakpoint for component
  setBreakpoint: (componentName: string) => {
    debugState.breakpoints.add(componentName);
    console.log(`%c[Debugger] Breakpoint set for ${componentName}`, 'color: #ef4444');
  },

  // Remove breakpoint for component
  removeBreakpoint: (componentName: string) => {
    debugState.breakpoints.delete(componentName);
    console.log(`%c[Debugger] Breakpoint removed for ${componentName}`, 'color: #10b981');
  },

  // Watch component
  watchComponent: (componentName: string) => {
    debugState.watchedComponents.add(componentName);
    console.log(`%c[Debugger] Watching ${componentName}`, 'color: #3b82f6');
  },

  // Unwatch component
  unwatchComponent: (componentName: string) => {
    debugState.watchedComponents.delete(componentName);
    console.log(`%c[Debugger] Stopped watching ${componentName}`, 'color: #6b7280');
  }
};

export default useDebugger;

