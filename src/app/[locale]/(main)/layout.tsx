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
    <>
      <PageHeader />
      <main className="relative w-full">
        {/* <StickyIcon /> */}
        <div className="overflow-x-hidden z-0 relative">
          <Banner />
          <div className="container-padding flex-1">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
