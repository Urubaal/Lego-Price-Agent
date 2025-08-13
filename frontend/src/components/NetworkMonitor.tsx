import React, { useState, useEffect, useRef } from 'react';
import { 
  GlobeAltIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  statusText: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  size?: number;
  headers?: Record<string, string>;
  error?: string;
}

interface NetworkStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalDataTransferred: number;
}

const NetworkMonitor: React.FC = () => {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [stats, setStats] = useState<NetworkStats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    totalDataTransferred: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const originalFetch = useRef<typeof fetch>();
  const originalXHROpen = useRef<any>();
  const originalXHRSend = useRef<any>();

  // Intercept fetch requests
  const interceptFetch = () => {
    if (originalFetch.current) return;

    originalFetch.current = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestId = Date.now().toString();
      const startTime = performance.now();
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';

      // Create request entry
      const request: NetworkRequest = {
        id: requestId,
        url,
        method,
        status: 0,
        statusText: '',
        startTime: Date.now()
      };

      setRequests(prev => [request, ...prev.slice(0, 99)]); // Keep last 100 requests

      try {
        const response = await originalFetch.current!(input, init);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Update request with response data
        const updatedRequest: NetworkRequest = {
          ...request,
          status: response.status,
          statusText: response.statusText,
          endTime: Date.now(),
          duration,
          headers: Object.fromEntries(response.headers.entries())
        };

        // Try to get response size
        try {
          const clonedResponse = response.clone();
          const text = await clonedResponse.text();
          updatedRequest.size = new Blob([text]).size;
        } catch (e) {
          // Couldn't get size
        }

        setRequests(prev => 
          prev.map(req => req.id === requestId ? updatedRequest : req)
        );

        updateStats();
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        const failedRequest: NetworkRequest = {
          ...request,
          status: 0,
          statusText: 'Network Error',
          endTime: Date.now(),
          duration,
          error: error instanceof Error ? error.message : 'Unknown error'
        };

        setRequests(prev => 
          prev.map(req => req.id === requestId ? failedRequest : req)
        );

        updateStats();
        throw error;
      }
    };
  };

  // Intercept XMLHttpRequest
  const interceptXHR = () => {
    if (originalXHROpen.current) return;

    const XHR = window.XMLHttpRequest;
    originalXHROpen.current = XHR.prototype.open;
    originalXHRSend.current = XHR.prototype.send;

    XHR.prototype.open = function(method: string, url: string) {
      this._networkMonitor = {
        method,
        url,
        startTime: performance.now()
      };
      return originalXHROpen.current!.apply(this, arguments as any);
    };

    XHR.prototype.send = function() {
      const requestId = Date.now().toString();
      const { method, url, startTime } = this._networkMonitor;

      const request: NetworkRequest = {
        id: requestId,
        url,
        method,
        status: 0,
        statusText: '',
        startTime: Date.now()
      };

      setRequests(prev => [request, ...prev.slice(0, 99)]);

      this.addEventListener('load', function() {
        const endTime = performance.now();
        const duration = endTime - startTime;

        const updatedRequest: NetworkRequest = {
          ...request,
          status: this.status,
          statusText: this.statusText,
          endTime: Date.now(),
          duration,
          size: this.response?.length || 0
        };

        setRequests(prev => 
          prev.map(req => req.id === requestId ? updatedRequest : req)
        );

        updateStats();
      });

      this.addEventListener('error', function() {
        const endTime = performance.now();
        const duration = endTime - startTime;

        const failedRequest: NetworkRequest = {
          ...request,
          status: 0,
          statusText: 'XHR Error',
          endTime: Date.now(),
          duration,
          error: 'XMLHttpRequest failed'
        };

        setRequests(prev => 
          prev.map(req => req.id === requestId ? failedRequest : req)
        );

        updateStats();
      });

      return originalXHRSend.current!.apply(this, arguments as any);
    };
  };

  // Start monitoring
  const startMonitoring = () => {
    setIsMonitoring(true);
    interceptFetch();
    interceptXHR();
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false);
    
    // Restore original functions
    if (originalFetch.current) {
      window.fetch = originalFetch.current;
      originalFetch.current = undefined;
    }
    
    if (originalXHROpen.current) {
      window.XMLHttpRequest.prototype.open = originalXHROpen.current;
      originalXHROpen.current = undefined;
    }
    
    if (originalXHRSend.current) {
      window.XMLHttpRequest.prototype.send = originalXHRSend.current;
      originalXHRSend.current = undefined;
    }
  };

  // Update statistics
  const updateStats = () => {
    const successful = requests.filter(req => req.status >= 200 && req.status < 300);
    const failed = requests.filter(req => req.status === 0 || req.status >= 400);
    const completed = requests.filter(req => req.duration !== undefined);
    
    const avgResponseTime = completed.length > 0 
      ? completed.reduce((sum, req) => sum + (req.duration || 0), 0) / completed.length
      : 0;
    
    const totalData = requests.reduce((sum, req) => sum + (req.size || 0), 0);

    setStats({
      totalRequests: requests.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageResponseTime: avgResponseTime,
      totalDataTransferred: totalData
    });
  };

  // Clear all requests
  const clearRequests = () => {
    setRequests([]);
    setStats({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalDataTransferred: 0
    });
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    if (filterMethod !== 'all' && request.method !== filterMethod) return false;
    if (filterStatus !== 'all') {
      if (filterStatus === 'success' && (request.status < 200 || request.status >= 300)) return false;
      if (filterStatus === 'error' && (request.status >= 200 && request.status < 400)) return false;
      if (filterStatus === 'failed' && request.status !== 0) return false;
    }
    if (searchTerm && !request.url.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Get status icon
  const getStatusIcon = (status: number, error?: string) => {
    if (error || status === 0) {
      return <XCircleIcon className="w-4 h-4 text-red-500" />;
    }
    if (status >= 200 && status < 300) {
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    }
    if (status >= 400) {
      return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
    }
    return <ClockIcon className="w-4 h-4 text-blue-500" />;
  };

  // Get status color
  const getStatusColor = (status: number, error?: string) => {
    if (error || status === 0) return 'text-red-400';
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 400) return 'text-yellow-400';
    return 'text-blue-400';
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration.toFixed(2)}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  useEffect(() => {
    updateStats();
  }, [requests]);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GlobeAltIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-medium text-gray-200">Network Monitor</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`px-3 py-1 text-xs rounded ${
                isMonitoring 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </button>
            <button
              onClick={clearRequests}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
        <div className="grid grid-cols-5 gap-4 text-xs">
          <div className="text-center">
            <div className="text-gray-400">Total</div>
            <div className="text-gray-200 font-semibold">{stats.totalRequests}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Success</div>
            <div className="text-green-400 font-semibold">{stats.successfulRequests}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Failed</div>
            <div className="text-red-400 font-semibold">{stats.failedRequests}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Avg Time</div>
            <div className="text-blue-400 font-semibold">
              {stats.averageResponseTime > 0 ? formatDuration(stats.averageResponseTime) : '0ms'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Data</div>
            <div className="text-purple-400 font-semibold">{formatBytes(stats.totalDataTransferred)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search URLs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
          />
          
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success (2xx)</option>
            <option value="error">Client Error (4xx)</option>
            <option value="failed">Network Failed</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            {requests.length === 0 
              ? 'No network requests yet. Start monitoring to see activity.'
              : 'No requests match the current filters.'
            }
          </div>
        ) : (
          <div className="divide-y divide-gray-600">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-4 hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(request.status, request.error)}
                      <span className="text-xs font-mono bg-gray-600 px-2 py-1 rounded">
                        {request.method}
                      </span>
                      <span className={`text-xs ${getStatusColor(request.status, request.error)}`}>
                        {request.status || 'N/A'} {request.statusText}
                      </span>
                      {request.duration && (
                        <span className="text-xs text-gray-400">
                          {formatDuration(request.duration)}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-2 break-all">
                      {request.url}
                    </div>
                    
                    {request.size && (
                      <div className="text-xs text-gray-400">
                        Size: {formatBytes(request.size)}
                      </div>
                    )}
                    
                    {request.error && (
                      <div className="text-xs text-red-400 mt-1">
                        Error: {request.error}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-gray-400 hover:text-gray-200 ml-2"
                  >
                    {showDetails ? 'Hide' : 'Show'} Details
                  </button>
                </div>
                
                {showDetails && request.headers && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="text-xs text-gray-400 mb-2">Headers:</div>
                    <div className="bg-gray-900 p-2 rounded text-xs font-mono">
                      {Object.entries(request.headers).map(([key, value]) => (
                        <div key={key} className="mb-1">
                          <span className="text-blue-400">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkMonitor;
