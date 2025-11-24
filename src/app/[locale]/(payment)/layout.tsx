import Footer from "@/components/shared/footer";
import "../../globals.css";
import Banner from "@/components/shared/banner";
import HeaderClient from "@/components/shared/client-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebarServer from "@/components/layout/sidebar/app-sidebar-server";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebarServer defaultOpen={false} />
      <div className="relative min-h-screen w-full">
        <HeaderClient hasSideBar />
        <div className="flex flex-col w-full col-span-5 overflow-x-hidden overflow-y-auto">
          <main className="flex-1 relative flex flex-col">
            <Banner height={200} />
            <div className="container-padding flex-1">{children}</div>
            <Footer />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
