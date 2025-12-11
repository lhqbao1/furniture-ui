import Footer from "@/components/shared/footer";
import "../../globals.css";
import Banner from "@/components/shared/banner";
import PageHeader from "@/components/shared/header";
import { loadStripe } from "@stripe/stripe-js";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (typeof window !== "undefined") {
    window.StripeInstance = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);
  }

  return (
    <>
      <PageHeader />
      <main className="relative min-h-screen w-full">
        <div className="flex flex-col w-full col-span-5 overflow-x-hidden overflow-y-auto">
          {/* <div className="flex-1 relative flex flex-col">
            <Banner height={200} />
            <div className="container-padding flex-1">{children}</div>
          </div> */}
          <div className="flex-1">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
