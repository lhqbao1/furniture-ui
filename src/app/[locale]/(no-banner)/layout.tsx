import Footer from "@/components/shared/footer";
import "../../globals.css"
import Banner from "@/components/shared/banner";
import HeaderClient from "@/components/shared/client-header";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative min-h-screen">
            <HeaderClient />
            <div className="flex flex-col w-full col-span-5 overflow-x-hidden overflow-y-auto">
                <main className="flex-1 relative flex flex-col">
                    <Banner height={200} />
                    <div className="container-padding flex-1">
                        {children}
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
