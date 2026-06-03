"use client";
import { ReactNode, useEffect, useState } from "react";
import { BeatLoader, FadeLoader } from "react-spinners";

interface ProtectedProps {
  children: ReactNode;
  redirectTo?: string;
  loadingLabel?: string;
}

export default function Protected({
  children,
  redirectTo = "/admin-login",
  loadingLabel = "admin",
}: ProtectedProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // check admin token trong localStorage
    const adminToken = localStorage.getItem("admin_access_token");
    if (!adminToken) {
      // không có token → redirect login
      window.location.href = redirectTo;
    } else {
      setIsAdmin(true);
    }
  }, [redirectTo]);

  if (isAdmin === null) {
    // màn hình loading với spinner và backdrop mờ
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* overlay mờ + blur */}
        <div className="absolute inset-0 bg-gray-100 backdrop-blur-sm" />

        {/* card spinner */}
        <div
          role="status"
          aria-live="polite"
          className="relative z-10 flex flex-col items-center gap-4"
        >
          {/* spinner */}
          <FadeLoader color="#00B159" />

          {/* text */}
          <div className="text-center">
            <p className="text-sm font-medium text-black">
              Loading {loadingLabel}...
            </p>
            <p className="mt-1 text-xs text-black">
              Checking access — please wait
            </p>
          </div>
          <BeatLoader
            color="#00B159"
            size={20}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
