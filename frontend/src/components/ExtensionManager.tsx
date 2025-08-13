import React, { useState, useEffect } from 'react';
import { 
  PuzzlePieceIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  Cog6ToothIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';

interface Extension {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  enabled: boolean;
  category: 'debug' | 'performance' | 'development' | 'utility';
  dependencies: string[];
  settings: Record<string, any>;
  status: 'active' | 'inactive' | 'error' | 'loading';
}

const ExtensionManager: React.FC = () => {
  const [extensions, setExtensions] = useState<Extension[]>([
    {
      id: 'react-devtools',
      name: 'React DevTools',
      description: 'React Developer Tools for debugging React components',
      version: '4.28.0',
      author: 'Facebook',
      enabled: true,
      category: 'debug',
      dependencies: ['react', 'react-dom'],
      settings: { highlightUpdates: true, showInlineWarnings: true },
      status: 'active'
    },
    {
      id: 'performance-monitor',
      name: 'Performance Monitor',
      description: 'Monitor component render performance and identify bottlenecks',
      version: '1.0.0',
      author: 'LEGO Price Agent',
      enabled: true,
      category: 'performance',
      dependencies: [],
      settings: { threshold: 16, maxMetrics: 100 },
      status: 'active'
    },
    {
      id: 'error-boundary',
      name: 'Error Boundary',
      description: 'Catch and display React component errors gracefully',
      version: '1.0.0',
      author: 'LEGO Price Agent',
      enabled: true,
      category: 'debug',
      dependencies: [],
      settings: { showStack: true, logToConsole: true },
      status: 'active'
    },
    {
      id: 'network-monitor',
      name: 'Network Monitor',
      description: 'Monitor HTTP requests and network performance',
      version: '1.0.0',
      author: 'LEGO Price Agent',
      enabled: true,
      category: 'development',
      dependencies: [],
      settings: { interceptFetch: true, interceptXHR: true },
      status: 'active'
    },
    {
      id: 'debug-console',
      name: 'Debug Console',
      description: 'Enhanced console with filtering and search capabilities',
      version: '1.0.0',
      author: 'LEGO Price Agent',
      enabled: true,
      category: 'debug',
      dependencies: [],
      settings: { logLevel: 'all', maxLogs: 1000 },
      status: 'active'
    },
    {
      id: 'component-inspector',
      name: 'Component Inspector',
      description: 'Inspect component props, state, and lifecycle',
      version: '1.0.0',
      author: 'LEGO Price Agent',
      enabled: false,
      category: 'debug',
      dependencies: ['react'],
      settings: { showProps: true, showState: true },
      status: 'inactive'
    },
    {
      id: 'memory-profiler',
      name: 'Memory Profiler',
      description: 'Monitor memory usage and detect memory leaks',
      version: '1.0.0',
      author: 'LEGO Price Agent',
      enabled: false,
      category: 'performance',
      dependencies: [],
      settings: { interval: 5000, maxSnapshots: 10 },
      status: 'inactive'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showSettings, setShowSettings] = useState<string | null>(null);

  // Toggle extension
  const toggleExtension = (extensionId: string) => {
    setExtensions(prev => prev.map(ext => 
      ext.id === extensionId 
        ? { ...ext, enabled: !ext.enabled, status: !ext.enabled ? 'loading' : 'inactive' }
        : ext
    ));

    // Simulate loading state
    setTimeout(() => {
      setExtensions(prev => prev.map(ext => 
        ext.id === extensionId 
          ? { ...ext, status: ext.enabled ? 'active' : 'inactive' }
          : ext
      ));
    }, 1000);
  };

  // Update extension settings
  const updateExtensionSettings = (extensionId: string, settings: Record<string, any>) => {
    setExtensions(prev => prev.map(ext => 
      ext.id === extensionId 
        ? { ...ext, settings: { ...ext.settings, ...settings } }
        : ext
    ));
  };

  // Install extension (simulated)
  const installExtension = (extensionId: string) => {
    const extension = extensions.find(ext => ext.id === extensionId);
    if (extension) {
      setExtensions(prev => prev.map(ext => 
        ext.id === extensionId 
          ? { ...ext, enabled: true, status: 'loading' }
          : ext
      ));

      // Simulate installation
      setTimeout(() => {
        setExtensions(prev => prev.map(ext => 
          ext.id === extensionId 
            ? { ...ext, status: 'active' }
            : ext
        ));
      }, 2000);
    }
  };

  // Uninstall extension
  const uninstallExtension = (extensionId: string) => {
    setExtensions(prev => prev.filter(ext => ext.id !== extensionId));
  };

  // Get status icon
  const getStatusIcon = (status: Extension['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircleIcon className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'loading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <XCircleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: Extension['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'inactive':
        return 'text-gray-400';
      case 'error':
        return 'text-red-400';
      case 'loading':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  // Get category color
  const getCategoryColor = (category: Extension['category']) => {
    switch (category) {
      case 'debug':
        return 'bg-blue-600 text-blue-100';
      case 'performance':
        return 'bg-green-600 text-green-100';
      case 'development':
        return 'bg-purple-600 text-purple-100';
      case 'utility':
        return 'bg-gray-600 text-gray-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  // Filter extensions
  const filteredExtensions = extensions.filter(extension => {
    if (searchTerm && !extension.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !extension.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterCategory !== 'all' && extension.category !== filterCategory) {
      return false;
    }
    if (filterStatus !== 'all') {
      if (filterStatus === 'enabled' && !extension.enabled) return false;
      if (filterStatus === 'disabled' && extension.enabled) return false;
      if (filterStatus === 'active' && extension.status !== 'active') return false;
    }
    return true;
  });

  // Get category stats
  const getCategoryStats = () => {
    const stats = { debug: 0, performance: 0, development: 0, utility: 0 };
    extensions.forEach(ext => {
      if (ext.enabled) {
        stats[ext.category]++;
      }
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PuzzlePieceIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-medium text-gray-200">Extension Manager</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
              <ArrowDownTrayIcon className="w-4 h-4 mr-1 inline" />
              Install New
            </button>
            <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700">
              <Cog6ToothIcon className="w-4 h-4 mr-1 inline" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="text-center">
            <div className="text-gray-400">Total</div>
            <div className="text-gray-200 font-semibold">{extensions.length}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Active</div>
            <div className="text-green-400 font-semibold">{extensions.filter(ext => ext.status === 'active').length}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Enabled</div>
            <div className="text-blue-400 font-semibold">{extensions.filter(ext => ext.enabled).length}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Errors</div>
            <div className="text-red-400 font-semibold">{extensions.filter(ext => ext.status === 'error').length}</div>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
        <div className="flex items-center space-x-4 text-xs">
          <span className="text-gray-400">Categories:</span>
          {Object.entries(categoryStats).map(([category, count]) => (
            <div key={category} className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(category as Extension['category'])}`}>
                {category}
              </span>
              <span className="text-gray-300">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search extensions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
          />
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="debug">Debug</option>
            <option value="performance">Performance</option>
            <option value="development">Development</option>
            <option value="utility">Utility</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>

      {/* Extensions List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredExtensions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No extensions match the current filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-600">
            {filteredExtensions.map((extension) => (
              <div key={extension.id} className="p-4 hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(extension.status)}
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(extension.category)}`}>
                        {extension.category}
                      </span>
                      <span className={`text-xs ${getStatusColor(extension.status)}`}>
                        {extension.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        v{extension.version}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-200 mb-1">
                      {extension.name}
                    </h4>
                    
                    <p className="text-xs text-gray-400 mb-2">
                      {extension.description}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      by {extension.author}
                    </div>
                    
                    {extension.dependencies.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Dependencies: {extension.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setShowSettings(showSettings === extension.id ? null : extension.id)}
                      className="text-xs text-gray-400 hover:text-gray-200"
                    >
                      <Cog6ToothIcon className="w-4 h-4" />
                    </button>
                    
                    {extension.enabled ? (
                      <button
                        onClick={() => toggleExtension(extension.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        <StopIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleExtension(extension.id)}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        <PlayIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => uninstallExtension(extension.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Extension Settings */}
                {showSettings === extension.id && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="text-xs text-gray-400 mb-2">Settings:</div>
                    <div className="space-y-2">
                      {Object.entries(extension.settings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-xs text-gray-300">{key}:</span>
                          {typeof value === 'boolean' ? (
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => updateExtensionSettings(extension.id, { [key]: e.target.checked })}
                              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                            />
                          ) : (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => updateExtensionSettings(extension.id, { [key]: e.target.value })}
                              className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded border border-gray-500 focus:outline-none focus:border-blue-500 w-24"
                            />
                          )}
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

export default ExtensionManager;
