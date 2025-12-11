import type { ReactNode } from "react";
import ClientAdminLayout from "./client-layout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <ClientAdminLayout>{children}</ClientAdminLayout>
      </body>
    </html>
  );
}
