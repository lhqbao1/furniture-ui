"use client";

import type { ReactNode } from "react";
import "../../globals.css";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSideBar } from "@/components/shared/admin-sidebar";
import Protected from "@/components/layout/auth/protected";
import AdminHeader from "@/components/shared/admin-header";

interface ClientAdminLayoutProps {
  children: ReactNode;
}

export default function ClientAdminLayout({
  children,
}: ClientAdminLayoutProps) {
  return (
    <Protected>
      <main>
        <SidebarProvider defaultOpen={true}>
          <AdminSideBar />

          <div className="container-padding lg:pt-8 pt-2 w-full pointer-events-auto">
            <AdminHeader />
            {children}
          </div>
        </SidebarProvider>
      </main>
    </Protected>
  );
}
