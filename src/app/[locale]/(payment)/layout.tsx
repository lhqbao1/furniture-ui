import Footer from "@/components/shared/footer";
import "../../globals.css";
import Banner from "@/components/shared/banner";
import PageHeader from "@/components/shared/header";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative min-h-screen w-full">
      <PageHeader />
      <div className="flex flex-col w-full col-span-5 overflow-x-hidden overflow-y-auto">
        <div className="flex-1 relative flex flex-col">
          <Banner height={200} />
          <div className="container-padding flex-1">{children}</div>
          <Footer />
        </div>
      </div>
    </main>
  );
}
