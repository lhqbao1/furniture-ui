import Banner from "@/components/shared/banner";
import "../../globals.css";
import PageHeader from "@/components/layout/header/header";
import Footer from "@/components/shared/footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-black focus:shadow"
      >
        Skip to content
      </a>
      <PageHeader />
      <main id="main-content" className="relative w-full min-h-screen">
        <div className="overflow-x-hidden z-0 relative">
          <Banner isHome />
          <div className="flex-1">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
