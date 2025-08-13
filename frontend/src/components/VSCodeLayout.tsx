import React, { useState } from 'react';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  BugAntIcon,
  CommandLineIcon,
  DocumentTextIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import ExtensionManager from './ExtensionManager';

interface VSCodeLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const VSCodeLayout: React.FC<VSCodeLayoutProps> = ({ children, currentPage }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState('explorer');
  const [showProblems, setShowProblems] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const activityBarItems = [
    { id: 'explorer', icon: FolderIcon, label: 'Explorer', active: activePanel === 'explorer' },
    { id: 'search', icon: MagnifyingGlassIcon, label: 'Search', active: activePanel === 'search' },
    { id: 'debug', icon: BugAntIcon, label: 'Run and Debug', active: activePanel === 'debug' },
    { id: 'extensions', icon: Cog6ToothIcon, label: 'Extensions', active: activePanel === 'extensions' },
  ];

  const renderSidebarContent = () => {
    switch (activePanel) {
      case 'explorer':
        return (
          <div className="p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">LEGO PRICE AGENT</div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600 hover:bg-gray-100 p-1 rounded cursor-pointer">
                <HomeIcon className="w-4 h-4 mr-2" />
                Home
              </div>
              <div className="flex items-center text-sm text-gray-600 hover:bg-gray-100 p-1 rounded cursor-pointer">
                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                Search
              </div>
              <div className="flex items-center text-sm text-gray-600 hover:bg-gray-100 p-1 rounded cursor-pointer">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Recommendations
              </div>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">SEARCH</div>
            <input 
              type="text" 
              placeholder="Search in files..." 
              className="w-full px-2 py-1 text-sm border rounded bg-gray-50"
            />
          </div>
        );
      case 'debug':
        return (
          <div className="p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">DEBUG</div>
            <div className="space-y-2">
              <button className="w-full px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Start Debugging
              </button>
              <button className="w-full px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
                Stop Debugging
              </button>
            </div>
          </div>
        );
      case 'extensions':
        return (
          <div className="p-4">
            <ExtensionManager />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Top Menu Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">LEGO Price Agent</span>
          <span className="text-xs text-gray-400">File</span>
          <span className="text-xs text-gray-400">Edit</span>
          <span className="text-xs text-gray-400">View</span>
          <span className="text-xs text-gray-400">Run</span>
          <span className="text-xs text-gray-400">Terminal</span>
          <span className="text-xs text-gray-400">Help</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-gray-900 border-r border-gray-700 flex flex-col items-center py-4 space-y-4">
          {activityBarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`p-2 rounded hover:bg-gray-700 transition-colors ${
                item.active ? 'bg-gray-700 text-blue-400' : 'text-gray-400'
              }`}
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </div>

        {/* Sidebar */}
        {!sidebarCollapsed && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            {renderSidebarContent()}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Tabs */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
            <div className="flex items-center space-x-1">
              <div className="px-3 py-1 bg-gray-700 text-gray-200 text-sm rounded-t">
                {currentPage}.tsx
              </div>
              <div className="px-3 py-1 text-gray-400 text-sm hover:text-gray-200 cursor-pointer">
                + New Tab
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 bg-gray-900 overflow-auto">
            <div className="p-4">
              {children}
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span>TypeScript React</span>
              <span>UTF-8</span>
              <span>LF</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Ln 1, Col 1</span>
              <span>Spaces: 2</span>
              <span>TypeScript: 5.2.2</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Panel Tabs */}
          <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
            <button
              onClick={() => setShowProblems(!showProblems)}
              className={`text-xs px-2 py-1 rounded ${
                showProblems ? 'bg-gray-600 text-white' : 'text-gray-400'
              }`}
            >
              Problems
            </button>
            <button
              onClick={() => setShowOutput(!showOutput)}
              className={`text-xs px-2 py-1 rounded ${
                showOutput ? 'bg-gray-600 text-white' : 'text-gray-400'
              }`}
            >
              Output
            </button>
            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className={`text-xs px-2 py-1 rounded ${
                showTerminal ? 'bg-gray-600 text-white' : 'text-gray-400'
              }`}
            >
              Terminal
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {showProblems && (
              <div className="text-sm">
                <div className="text-gray-400 mb-2">No problems detected</div>
              </div>
            )}
            {showOutput && (
              <div className="text-sm">
                <div className="text-gray-400 mb-2">Output</div>
                <div className="text-green-400">✓ Build completed successfully</div>
              </div>
            )}
            {showTerminal && (
              <div className="text-sm">
                <div className="text-gray-400 mb-2">Terminal</div>
                <div className="text-green-400">$ npm run dev</div>
                <div className="text-gray-300">✓ Vite dev server running on http://localhost:5173</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VSCodeLayout;

