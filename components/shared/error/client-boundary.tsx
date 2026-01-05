"use client";

import React from "react";
import { RefreshCcw, RotateCw } from "lucide-react";

interface State {
  hasError: boolean;
  error?: Error;
}

const AUTO_RELOAD_KEY = "__auto_reload_done__";

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

    // 🔁 Auto reload ONE TIME
    if (typeof window !== "undefined") {
      const hasReloaded = sessionStorage.getItem(AUTO_RELOAD_KEY);

      if (!hasReloaded) {
        sessionStorage.setItem(AUTO_RELOAD_KEY, "true");
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    }
  }

  handleReset = () => {
    sessionStorage.removeItem(AUTO_RELOAD_KEY);
    this.setState({ hasError: false, error: undefined });
  };

  handleReload = () => {
    sessionStorage.removeItem(AUTO_RELOAD_KEY);
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl">⚠️</span>
            </div>

            <h1 className="text-2xl font-semibold text-gray-800">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              An unexpected error occurred. Please try again or reload the page.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
              >
                <RotateCw size={16} />
                Try again
              </button>

              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCcw size={16} />
                Reload page
              </button>
            </div>

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
