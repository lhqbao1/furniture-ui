"use client";

import type { ReactNode } from "react";
import "../../globals.css";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSideBar } from "@/components/shared/admin-sidebar";
import Protected from "@/components/layout/auth/protected";
import AdminHeader from "@/components/shared/admin-header";

export default function ClientAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main>
      <Protected>
        <div className="flex">
          <SidebarProvider defaultOpen>
            <AdminSideBar />
            <div className="container-padding lg:pt-8 pt-2 w-full pointer-events-auto">
              <AdminHeader />
              {children}
            </div>
          </SidebarProvider>
        </div>
      </Protected>
    </main>
  );
}
