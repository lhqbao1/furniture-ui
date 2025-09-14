import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/components/shared/footer";
import StickyIcon from "@/components/shared/sticky-icon";
import Banner from "@/components/shared/banner";
import "../../globals.css"
import AppSidebarServer from "@/components/layout/app-sidebar-server";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <div className="w-screen flex overflow-hidden min-h-screen">
                <AppSidebarServer />
                <div className="flex flex-col w-full col-span-5 overflow-x-hidden overflow-y-auto">
                    <main className="flex-1 relative flex flex-col">
                        {/* <StickyIcon /> */}
                        <Banner height={200} />
                        <div className="container-padding flex-1">
                            {children}
                        </div>
                        <Footer />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
