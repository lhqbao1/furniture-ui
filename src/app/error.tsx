"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 🔥 LOG LỖI CHI TIẾT
    console.error("🔥 Global error caught:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 px-4">
          <h1 className="text-3xl font-bold text-red-600">
            Something went wrong
          </h1>

          <p className="text-gray-600 max-w-md">
            An unexpected error occurred. Please try again or contact support.
          </p>

          {/* Optional: hiển thị message ở dev */}
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 max-w-xl overflow-auto rounded bg-gray-100 p-4 text-left text-sm text-red-500">
              {error.message}
            </pre>
          )}

          <button
            onClick={() => reset()}
            className="mt-6 rounded bg-black px-6 py-2 text-white hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
