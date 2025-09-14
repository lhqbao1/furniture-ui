import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/components/shared/footer";
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
      <AppSidebarServer />
      <main className="relative overflow-x-hidden">
        {/* <StickyIcon /> */}
        <Banner />
        <div className="container-padding flex-1">
          {children}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
}
