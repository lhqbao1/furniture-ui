import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import Footer from "@/components/shared/footer";
import Banner from "@/components/shared/banner";
import "../../globals.css"
import PageHeader from "@/components/shared/header";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
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
