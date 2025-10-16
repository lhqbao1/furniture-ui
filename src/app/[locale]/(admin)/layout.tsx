import "../../globals.css"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSideBar } from "@/components/shared/admin-sidebar";
import Protected from "@/components/layout/auth/protected";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Protected>
            <SidebarProvider defaultOpen={true}>
                <AdminSideBar />
                <div className="container-padding pt-8 w-full">
                    <div>
                        <SidebarTrigger className={`border-none text-[#4D4D4D] relative`} />
                    </div>
                    {children}
                </div>
            </SidebarProvider>
        </Protected>
    );
}
