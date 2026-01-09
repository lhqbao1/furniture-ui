"use client";

import { useEffect } from "react";

const AUTO_RELOAD_KEY = "__global_auto_reload_done__";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("🔥 Global error caught:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });

    // 🔁 Auto reload ONE TIME only
    if (typeof window !== "undefined") {
      const hasReloaded = sessionStorage.getItem(AUTO_RELOAD_KEY);

      if (!hasReloaded) {
        sessionStorage.setItem(AUTO_RELOAD_KEY, "true");

        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 px-4">
          <h1 className="text-3xl font-bold text-red-600">
            Something went wrong
          </h1>

          <p className="text-gray-600 max-w-md">
            An unexpected error occurred. Please try again or reload the page.
          </p>

          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 max-w-xl overflow-auto rounded bg-gray-100 p-4 text-left text-sm text-red-500">
              {error.message}
            </pre>
          )}

          <pre className="mt-4 max-w-xl overflow-auto rounded bg-gray-100 p-4 text-left text-sm text-red-500">
            Error from extensions
          </pre>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                sessionStorage.removeItem(AUTO_RELOAD_KEY);
                reset();
              }}
              className="rounded bg-black px-6 py-2 text-white hover:bg-gray-800"
            >
              Try again
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem(AUTO_RELOAD_KEY);
                window.location.reload();
              }}
              className="rounded border px-6 py-2 hover:bg-gray-50"
            >
              Reload page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
