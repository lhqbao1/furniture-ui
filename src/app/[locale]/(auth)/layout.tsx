import type { Metadata } from "next";
import "../../globals.css"

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-screen w-screen overflow-hidden overflow-y-scroll min-h-screen">
            <main className="flex-1 relative">
                <div className="">
                    {children}
                </div>
            </main>
        </div>
    );
}
