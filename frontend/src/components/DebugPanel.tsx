import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  PauseIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import NetworkMonitor from './NetworkMonitor';

interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: Date;
  component?: string;
  data?: any;
}

interface PerformanceMetric {
  component: string;
  renderTime: number;
  timestamp: Date;
}

const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);
  const [breakpoints, setBreakpoints] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);

  // Debug logger
  const log = (level: LogEntry['level'], message: string, component?: string, data?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      level,
      message,
      timestamp: new Date(),
      component,
      data
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  // Performance monitoring
  const measurePerformance = (componentName: string, renderTime: number) => {
    const metric: PerformanceMetric = {
      component: componentName,
      renderTime,
      timestamp: new Date()
    };
    setPerformanceMetrics(prev => [metric, ...prev.slice(0, 49)]); // Keep last 50 metrics
  };

  // Start debugging session
  const startDebugging = () => {
    setIsDebugging(true);
    log('info', 'Debug session started', 'DebugPanel');
    
    // Simulate some debug info
    setTimeout(() => {
      log('debug', 'Component tree loaded', 'DebugPanel');
      log('debug', 'State initialized', 'DebugPanel');
      log('info', 'Ready for debugging', 'DebugPanel');
    }, 1000);
  };

  // Stop debugging session
  const stopDebugging = () => {
    setIsDebugging(false);
    log('info', 'Debug session stopped', 'DebugPanel');
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    log('info', 'Console cleared', 'DebugPanel');
  };

  // Add breakpoint
  const addBreakpoint = (component: string) => {
    if (!breakpoints.includes(component)) {
      setBreakpoints(prev => [...prev, component]);
      log('info', `Breakpoint added for ${component}`, 'DebugPanel');
    }
  };

  // Remove breakpoint
  const removeBreakpoint = (component: string) => {
    setBreakpoints(prev => prev.filter(bp => bp !== component));
    log('info', `Breakpoint removed for ${component}`, 'DebugPanel');
  };

  // Simulate error for testing
  const simulateError = () => {
    log('error', 'Simulated error for testing purposes', 'DebugPanel', { 
      stack: 'Error: Simulated error\n    at DebugPanel.simulateError\n    at onClick' 
    });
  };

  // Simulate warning
  const simulateWarning = () => {
    log('warn', 'Simulated warning for testing purposes', 'DebugPanel');
  };

  // Simulate performance issue
  const simulatePerformanceIssue = () => {
    const slowRenderTime = Math.random() * 100 + 50; // 50-150ms
    measurePerformance('SimulatedComponent', slowRenderTime);
    log('warn', `Performance issue detected: ${slowRenderTime.toFixed(2)}ms render time`, 'DebugPanel');
  };

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />;
      case 'debug':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      case 'debug':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Debug Controls */}
      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={startDebugging}
              disabled={isDebugging}
              className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="w-4 h-4 mr-1" />
              Start
            </button>
            <button
              onClick={stopDebugging}
              disabled={!isDebugging}
              className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <StopIcon className="w-4 h-4 mr-1" />
              Stop
            </button>
            <button
              onClick={clearLogs}
              className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Clear
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={simulateError}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              Test Error
            </button>
            <button
              onClick={simulateWarning}
              className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
            >
              Test Warning
            </button>
            <button
              onClick={simulatePerformanceIssue}
              className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
            >
              Test Performance
            </button>
          </div>
        </div>
      </div>

      {/* Debug Tabs */}
      <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`text-xs px-2 py-1 rounded ${
              showConsole ? 'bg-gray-600 text-white' : 'text-gray-400'
            }`}
          >
            Console
          </button>
          <button
            onClick={() => setShowPerformance(!showPerformance)}
            className={`text-xs px-2 py-1 rounded ${
              showPerformance ? 'bg-gray-600 text-white' : 'text-gray-400'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setShowNetwork(!showNetwork)}
            className={`text-xs px-2 py-1 rounded ${
              showNetwork ? 'bg-gray-600 text-white' : 'text-gray-400'
            }`}
          >
            Network
          </button>
        </div>
      </div>

      {/* Debug Content */}
      <div className="h-64 overflow-y-auto">
        {showConsole && (
          <div className="p-4 space-y-2">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-8">
                No logs yet. Start debugging to see activity.
              </div>
            ) : (
              logs.map((logEntry) => (
                <div key={logEntry.id} className="flex items-start space-x-2 text-sm">
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(logEntry.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`${getLogColor(logEntry.level)} font-mono`}>
                      {logEntry.message}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {logEntry.timestamp.toLocaleTimeString()}
                      {logEntry.component && ` • ${logEntry.component}`}
                    </div>
                    {logEntry.data && (
                      <details className="mt-1">
                        <summary className="text-gray-400 cursor-pointer text-xs">
                          Show data
                        </summary>
                        <pre className="text-xs text-gray-300 mt-1 bg-gray-900 p-2 rounded overflow-x-auto">
                          {JSON.stringify(logEntry.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showPerformance && (
          <div className="p-4 space-y-2">
            <div className="text-sm font-medium text-gray-300 mb-3">Performance Metrics</div>
            {performanceMetrics.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-8">
                No performance data yet.
              </div>
            ) : (
              performanceMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-700 rounded">
                  <span className="text-gray-300">{metric.component}</span>
                  <span className={`font-mono ${
                    metric.renderTime > 100 ? 'text-red-400' : 
                    metric.renderTime > 50 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {metric.renderTime.toFixed(2)}ms
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {showNetwork && (
          <div className="p-4">
            <NetworkMonitor />
          </div>
        )}
      </div>

      {/* Breakpoints Panel */}
      <div className="bg-gray-700 px-4 py-2 border-t border-gray-600">
        <div className="text-xs text-gray-400 mb-2">Breakpoints</div>
        <div className="flex flex-wrap gap-2">
          {breakpoints.map((component) => (
            <div key={component} className="flex items-center space-x-2 bg-gray-600 px-2 py-1 rounded text-xs">
              <span className="text-gray-300">{component}</span>
              <button
                onClick={() => removeBreakpoint(component)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          ))}
          {breakpoints.length === 0 && (
            <span className="text-gray-500 text-xs">No breakpoints set</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;

