import React, { Component, ReactNode } from 'react';

/**
 * ErrorBoundary component props interface
 */
export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * ErrorBoundary component state interface
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 *
 * A React error boundary for graceful error handling and crash recovery.
 * Catches JavaScript errors in child components and displays a friendly fallback UI.
 * Prevents the entire app from crashing due to component errors.
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error) => console.error(error)}>
 *   <FlashCardSession />
 * </ErrorBoundary>
 *
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <UserSettings />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50"
          role="alert"
        >
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <svg
                className="w-20 h-20 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 mb-6">
              Don&apos;t worry! Your progress has been saved. Try refreshing the page or going back to the home screen.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-40 text-red-600">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="min-h-[52px] px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 touch-manipulation"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="min-h-[52px] px-8 py-4 bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-offset-2 touch-manipulation"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
