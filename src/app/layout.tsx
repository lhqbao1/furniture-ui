import type { Metadata } from "next";
import { Figtree, Libre_Caslon_Display } from "next/font/google";
import "./globals.css";
import Providers from "./provider";
import { Toaster } from "@/components/ui/sonner"
import Script from "next/script";
import { GoogleTagManager } from '@next/third-parties/google'
import Head from "next/head";

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
        <html lang="de">
            <Head>
                {/* 🚫 Autoblocker script — phải đứng đầu để chặn các dịch vụ trước khi có consent */}
                <script
                    id="usercentrics-autoblocker"
                    src="https://web.cmp.usercentrics.eu/modules/autoblocker.js"
                    async
                />

                {/* ✅ GTM init script — chèn thủ công để tránh lỗi ESLint */}
                <script
                    id="GTM"
                    dangerouslySetInnerHTML={{
                        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WKVQP2QH');`,
                    }}
                />

                {/* ✅ CMP loader script (Usercentrics) */}
                <script
                    id="usercentrics-cmp"
                    src="https://web.cmp.usercentrics.eu/ui/loader.js"
                    data-settings-id="RlDaintBne_uoh"
                    async
                />
            </Head>
            <body className={`${figtree.variable} ${libre.variable} font-sans antialiased`}>
                <GoogleTagManager gtmId="" />
                {/* Google Tag Manager (noscript) */}
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-WKVQP2QH"
                        height="0"
                        width="0"
                        style={{ display: "none", visibility: "hidden" }}
                    ></iframe>
                </noscript>
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
        </html >
    );
}
