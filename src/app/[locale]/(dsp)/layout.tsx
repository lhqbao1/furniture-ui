import "../../globals.css";
import ClientSupplierAdminLayout from "./client-layout";

export default function DSPAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientSupplierAdminLayout>{children}</ClientSupplierAdminLayout>;
}
