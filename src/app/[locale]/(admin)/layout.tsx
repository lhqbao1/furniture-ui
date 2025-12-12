import type { ReactNode } from "react";
import ClientAdminLayout from "./client-layout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ClientAdminLayout>{children}</ClientAdminLayout>;
}
