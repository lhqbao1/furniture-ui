import type { Metadata } from "next";
import DashboardPageClient from "./dashboard-page-client";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
