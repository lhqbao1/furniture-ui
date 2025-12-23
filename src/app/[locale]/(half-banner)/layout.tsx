import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/components/shared/footer";
import Banner from "@/components/shared/banner";
import "../../globals.css";
import PageHeader from "@/components/layout/header/header";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PageHeader />
      <main className="relative w-full">
        {/* <StickyIcon /> */}
        <div className="overflow-x-hidden">
          <Banner height={200} />
          <div className="container-padding flex-1 min-h-screen">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
