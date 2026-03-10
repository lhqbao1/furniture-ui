import type { ReactNode } from "react";
import type { Metadata } from "next";
import ClientAdminLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Admin",
  description:
    "Interner Administrationsbereich von Prestige Home. Nicht für Suchmaschinen indexiert.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ClientAdminLayout>{children}</ClientAdminLayout>;
}
