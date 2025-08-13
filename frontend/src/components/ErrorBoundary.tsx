import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, BugAntIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Here you could also log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleCopyError = () => {
    const errorDetails = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      // Show feedback that error was copied
      const button = document.getElementById('copy-error-btn');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800 rounded-lg border border-red-500/20 shadow-xl">
            {/* Error Header */}
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
                <div>
                  <h1 className="text-xl font-semibold text-red-400">Something went wrong</h1>
                  <p className="text-gray-400 text-sm">An error occurred while rendering this component</p>
                </div>
              </div>
            </div>

            {/* Error Details */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Error Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Error ID:</span>
                    <span className="text-gray-200 font-mono">{this.state.errorId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Error Type:</span>
                    <span className="text-red-400 font-mono">{this.state.error?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Message:</span>
                    <span className="text-gray-200 font-mono max-w-xs truncate" title={this.state.error?.message}>
                      {this.state.error?.message || 'No error message'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Stack (Collapsible) */}
              {this.state.error?.stack && (
                <div className="bg-gray-700 rounded-lg">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-600 rounded-t-lg">
                      <span className="text-sm font-medium text-gray-300">Error Stack Trace</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="p-4 border-t border-gray-600">
                      <pre className="text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </details>
                </div>
              )}

              {/* Component Stack (Collapsible) */}
              {this.state.errorInfo?.componentStack && (
                <div className="bg-gray-700 rounded-lg">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-600 rounded-t-lg">
                      <span className="text-sm font-medium text-gray-300">Component Stack</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="p-4 border-t border-gray-600">
                      <pre className="text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={this.handleReset}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BugAntIcon className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                  <button
                    onClick={this.handleCopyError}
                    id="copy-error-btn"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Copy Error
                  </button>
                </div>
                
                <button
                  onClick={this.handleReload}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Reload Page
                </button>
              </div>

              {/* Help Text */}
              <div className="text-center text-xs text-gray-500 pt-2">
                <p>If this error persists, please contact support with the Error ID above.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

