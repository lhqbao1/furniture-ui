"use client";

import type { ReactNode } from "react";
import "../../globals.css";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSideBar } from "@/components/layout/admin/admin-sidebar";
import Protected from "@/components/layout/auth/protected";
import AdminHeader from "@/components/layout/admin/admin-header";

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
            <div className="container-padding lg:pt-8 pt-2 xl:w-[calc(100%-240px)] pointer-events-auto overflow-auto">
              <AdminHeader />
              {children}
            </div>
          </SidebarProvider>
        </div>
      </Protected>
    </main>
  );
}
