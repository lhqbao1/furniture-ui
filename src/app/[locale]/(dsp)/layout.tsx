import type { Metadata } from "next";
import "../../globals.css"
import { SidebarProvider } from "@/components/ui/sidebar";
import DSPProtected from "@/components/layout/auth/dsp-protected";
import { DSPAdminSidebar } from "@/components/shared/dsp-sidebar";

export default function DSPAdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <DSPProtected>
            <SidebarProvider defaultOpen={true}>
                <DSPAdminSidebar />
                <div className="container-padding pt-8 w-full overflow-x-scroll">
                    {children}
                </div>
            </SidebarProvider>
        </DSPProtected>
    );
}
