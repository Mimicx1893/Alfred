import React, { Component, ErrorInfo } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const prefix = this.props.name ? `[ErrorBoundary: ${this.props.name}]` : '[ErrorBoundary]';
    console.error(prefix, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center h-full bg-gotham-panel border border-gotham-danger/50 rounded-lg p-6">
          <div className="text-gotham-danger text-sm font-bold tracking-widest mb-2">COMPONENT ERROR</div>
          <div className="text-gotham-muted text-xs text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-gotham-dark border border-gotham-border text-gotham-text text-xs rounded hover:border-gotham-accent/50 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
