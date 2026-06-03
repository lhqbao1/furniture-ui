import type { Metadata } from "next";
import type { ReactNode } from "react";

import ClientAffiliateLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Affiliate",
  description:
    "Interner Affiliate Bereich von Prestige Home. Nicht fuer Suchmaschinen indexiert.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AffiliateLayout({ children }: { children: ReactNode }) {
  return <ClientAffiliateLayout>{children}</ClientAffiliateLayout>;
}
