"use client";

import React from "react";
import { RefreshCcw, RotateCw } from "lucide-react";

interface State {
  hasError: boolean;
  error?: Error;
}

class ClientBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("🔥 Client runtime crash:", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl">⚠️</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-800">
              Something went wrong
            </h1>

            {/* Description */}
            <p className="mt-2 text-sm text-gray-600">
              An unexpected error occurred on this page. You can try again or
              reload the page.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
              >
                <RotateCw size={16} />
                Try again
              </button>

              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
              >
                <RefreshCcw size={16} />
                Reload page
              </button>
            </div>

            {/* Error detail (dev only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="mt-6 max-h-40 overflow-auto rounded bg-gray-100 p-3 text-left text-xs text-red-600">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ClientBoundary;
