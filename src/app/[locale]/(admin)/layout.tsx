import type { Metadata } from "next";
import "../../globals.css"
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSideBar } from "@/components/shared/admin-sidebar";
import Protected from "@/components/layout/auth/protected";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Protected>

            <SidebarProvider defaultOpen={true}>
                <AdminSideBar />
                <div className="container-padding pt-8 w-full overflow-x-scroll">
                    {children}
                </div>
            </SidebarProvider>
        </Protected>
    );
}
