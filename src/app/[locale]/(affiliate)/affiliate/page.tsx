"use client";

import Image from "next/image";
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
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4">
          <div className="flex justify-center">
            <Image
              src="/new-logo.svg"
              alt="Prestige Home"
              width={103}
              height={92}
              priority
              className="h-14 w-auto"
            />
          </div>
          <div className="flex gap-2 rounded-full border border-secondary/20 bg-white p-1 shadow-sm">
            <Button
              type="button"
              variant={activeTab === "dashboard" ? "secondary" : "ghost"}
              className={`flex-1 rounded-full ${
                activeTab === "dashboard"
                  ? "bg-secondary text-white hover:bg-secondary/90"
                  : "text-slate-600 hover:bg-secondary/10 hover:text-secondary"
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
                  ? "bg-secondary text-white hover:bg-secondary/90"
                  : "text-slate-600 hover:bg-secondary/10 hover:text-secondary"
              }`}
              onClick={() => handleTabChange("events")}
            >
              Events
            </Button>
          </div>
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
