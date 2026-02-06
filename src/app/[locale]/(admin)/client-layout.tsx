"use client";

import type { ReactNode } from "react";
import "../../globals.css";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AdminSideBar } from "@/components/layout/admin/admin-sidebar";
import Protected from "@/components/layout/auth/protected";
import AdminHeader from "@/components/layout/admin/admin-header";
import clsx from "clsx";

function AdminContent({ children }: { children: ReactNode }) {
  const { open } = useSidebar();

  return (
    <div
      className={clsx(
        "px-8 lg:pt-8 pt-2 pointer-events-auto overflow-auto transition-all duration-300 relative",
        open ? "xl:w-[calc(100%-240px)]" : "xl:w-[calc(100%)]", // width khi sidebar collapsed
      )}
    >
      <AdminHeader />
      {children}
    </div>
  );
}

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
            <AdminContent>{children}</AdminContent>
          </SidebarProvider>
        </div>
      </Protected>
    </main>
  );
}
