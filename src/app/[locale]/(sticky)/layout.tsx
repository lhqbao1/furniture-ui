import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/components/shared/footer";
import Banner from "@/components/shared/banner";
import "../../globals.css"
import AppSidebarServer from "@/components/layout/app-sidebar-server";
import HeaderClient from "@/components/shared/client-header";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebarServer />
            <main className="relative w-full">
                {/* <StickyIcon /> */}
                <HeaderClient hasSideBar />
                <div className="">
                    <Banner height={200} />
                    <div className="container-padding flex-1">
                        {children}
                    </div>
                    <Footer />
                </div>
            </main>
        </SidebarProvider>
    );
}
