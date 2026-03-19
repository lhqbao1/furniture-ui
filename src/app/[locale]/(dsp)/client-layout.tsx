"use client";

import type { ReactNode } from "react";
import "../../globals.css";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DSPProtected from "@/components/layout/auth/dsp-protected";
import { DSPAdminSidebar } from "@/components/layout/dsp/admin/dsp-sidebar";

export default function ClientSupplierAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main>
      <DSPProtected>
        <SidebarProvider defaultOpen={true}>
          <DSPAdminSidebar />
          <SidebarTrigger
            className={`border-none text-[#4D4D4D] relative pt-2 pl-2`}
          />
          <div className="container-padding pt-8 w-full overflow-x-scroll">
            {children}
          </div>
        </SidebarProvider>
      </DSPProtected>
    </main>
  );
}
