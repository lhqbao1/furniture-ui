"use client";

import { useSearchParams } from "next/navigation";

import AffiliateDashboard from "@/components/layout/affiliate/dashboard";
import AffiliateEventsPage from "@/components/layout/affiliate/events";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/src/i18n/navigation";

const AffiliatePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab =
    searchParams.get("tab") === "events" ? "events" : "dashboard";

  const handleTabChange = (tab: "dashboard" | "events") => {
    const params = new URLSearchParams(searchParams);

    if (tab === "events") {
      params.set("tab", "events");
    } else {
      params.delete("tab");
    }

    const nextUrl = params.toString() ? `?${params.toString()}` : "?";
    router.replace(nextUrl, { scroll: false });
  };

  return (
    <>
      <div className="bg-[#f6f8f4] px-4 pt-6 md:px-8">
        <div className="mx-auto flex w-full max-w-[1480px] gap-2 rounded-full border border-emerald-100 bg-white p-1 shadow-sm">
          <Button
            type="button"
            variant={activeTab === "dashboard" ? "secondary" : "ghost"}
            className={`flex-1 rounded-full ${
              activeTab === "dashboard"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
            onClick={() => handleTabChange("dashboard")}
          >
            Dashboard
          </Button>
          <Button
            type="button"
            variant={activeTab === "events" ? "secondary" : "ghost"}
            className={`flex-1 rounded-full ${
              activeTab === "events"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
            onClick={() => handleTabChange("events")}
          >
            Events
          </Button>
        </div>
      </div>

      {activeTab === "events" ? (
        <AffiliateEventsPage />
      ) : (
        <AffiliateDashboard />
      )}
    </>
  );
};

export default AffiliatePage;
