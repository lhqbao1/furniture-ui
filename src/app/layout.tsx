import type { Metadata } from "next";
import { Figtree, Libre_Caslon_Display } from "next/font/google";
import "./globals.css";
import Providers from "./provider";
import { Toaster } from "@/components/ui/sonner"
import Head from "next/head";
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
        <html lang="de">
            <head>
                {/* <Script
                    id="GTM"
                    dangerouslySetInnerHTML={{
                        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WKVQP2QH');`,
                    }}
                    async
                /> */}

                {/* <Script
                    src="https://www.googletagmanager.com/gtag/js?id=AW-17548008377"
                    async
                />
                <Script
                    id="gtag-base"
                    strategy="afterInteractive"
                >
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'AW-17548008377');
                    `}
                </Script>

                <Script
                    id="usercentrics-autoblocker"
                    src="https://web.cmp.usercentrics.eu/modules/autoblocker.js"
                    async
                />
                <Script id="usercentrics-cmp" src="https://web.cmp.usercentrics.eu/ui/loader.js" data-settings-id="RlDaintBne_uoh" async strategy="afterInteractive" /> */}
            </head>
            <body className={`${figtree.variable} ${libre.variable} font-sans antialiased`}>
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
