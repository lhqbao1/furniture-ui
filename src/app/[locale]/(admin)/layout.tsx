import "../../globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSideBar } from "@/components/shared/admin-sidebar";
import Protected from "@/components/layout/auth/protected";
import AdminHeader from "@/components/shared/admin-header";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Protected>
      <SidebarProvider defaultOpen={true}>
        <AdminSideBar />
        <div className="container-padding lg:pt-8 pt-2 w-full">
          <AdminHeader />
          {children}
        </div>
      </SidebarProvider>
    </Protected>
  );
}
