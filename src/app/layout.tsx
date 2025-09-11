import type { Metadata } from "next";
import { Figtree, Libre_Caslon_Display, Quicksand } from "next/font/google";
import "./globals.css";
import Providers from "./provider";
import { Toaster } from "@/components/ui/sonner"
import CursorLoadingHandler from "@/components/shared/cursor-loader";
import Script from "next/script";

const figtree = Figtree({
    subsets: ["latin"],
    variable: "--font-figtree",
});

const libre = Libre_Caslon_Display({
    subsets: ["latin"],
    weight: '400',
    variable: "--font-libre",
});

export const metadata: Metadata = {
    title: 'Prestige Home',
    description: 'Prestige Home',
    icons: {
        icon: [
            { url: '/new-logo.svg', type: 'image/png', sizes: '16x16' },
            { url: '/new-logo.svg', type: 'image/png', sizes: '32x32' },
            { url: '/new-logo.svg', type: 'image/png' },
        ],
        apple: '/new-logo.svg', // cho iOS
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <Script
                    src="https://web.cmp.usercentrics.eu/modules/autoblocker.js"
                    strategy="afterInteractive"
                />
                <Script
                    id="usercentrics-cmp"
                    src="https://web.cmp.usercentrics.eu/ui/loader.js"
                    data-settings-id="RlDaintBne_uoh"
                    strategy="afterInteractive"
                    async
                />
            </head>
            <body className={`${figtree.variable} ${libre.variable} font-sans antialiased`}>
                <CursorLoadingHandler />
                <Providers>{children}</Providers>
                <Toaster
                    richColors
                    position="top-right"
                    closeButton
                    toastOptions={{
                        className: "bg-[rgba(81,190,140,0.2)] text-white z-100",
                    }}
                />
            </body>
        </html>
    );
}
