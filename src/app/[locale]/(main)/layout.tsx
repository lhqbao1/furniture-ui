import Banner from "@/components/shared/banner";
import "../../globals.css";
import PageHeader from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative w-full">
      {/* <StickyIcon /> */}
      <PageHeader />
      <div className="overflow-x-hidden z-0 relative">
        <Banner />
        <div className="container-padding flex-1">{children}</div>
      </div>
      <Footer />
    </main>
  );
}
