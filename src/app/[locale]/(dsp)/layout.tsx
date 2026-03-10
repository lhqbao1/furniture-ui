import "../../globals.css";
import type { Metadata } from "next";
import ClientSupplierAdminLayout from "./client-layout";

export const metadata: Metadata = {
  title: "DSP Admin",
  description:
    "Interner DSP-Administrationsbereich von Prestige Home. Nicht für Suchmaschinen indexiert.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DSPAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientSupplierAdminLayout>{children}</ClientSupplierAdminLayout>;
}
