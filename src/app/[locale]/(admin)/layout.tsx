import type { ReactNode } from "react";
import ClientAdminLayout from "./client-layout";

export default function Layout({ children }: { children: ReactNode }) {
  return <ClientAdminLayout>{children}</ClientAdminLayout>;
}
