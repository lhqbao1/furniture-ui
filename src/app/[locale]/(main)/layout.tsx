import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/components/shared/footer";
import Banner from "@/components/shared/banner";
import "../../globals.css";
import HeaderClient from "@/components/shared/client-header";
import AppSidebarServer from "@/components/layout/sidebar/app-sidebar-server";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebarServer />
      <div>
        <main className="relative w-full">
          {/* <StickyIcon /> */}
          <HeaderClient hasSideBar />
          <div className="overflow-x-hidden z-0 relative">
            <Banner />
            <div className="container-padding flex-1">{children}</div>
          </div>
        </main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
