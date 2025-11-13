import type { Metadata } from "next";
import { Figtree, Libre_Caslon_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { QueryProvider } from "@/lib/query-provider";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const libre = Libre_Caslon_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-libre",
});

export const metadata: Metadata = {
  title: "Prestige Home",
  description: "Prestige Home",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        {/* Google Tag Manager script (optimized) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17548008377"
          strategy="lazyOnload"
        />

        <Script
          id="gtag-base"
          strategy="lazyOnload"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17548008377');
          `}
        </Script>

        {/* Google Ads conversion (delayed) */}
        <Script
          id="google-ads-conversion"
          strategy="lazyOnload"
        >
          {`
            gtag('event', 'conversion', {
              'send_to': 'AW-17548008377/U6FbCPzkkqEbELm3xa9B'
            });
          `}
        </Script>

        {/* Autoblocker must be early */}
        <Script
          id="usercentrics-autoblocker"
          src="https://web.cmp.usercentrics.eu/modules/autoblocker.js"
          strategy="beforeInteractive"
        />

        {/* CMP loader (optimized lazy loading) */}
        <Script
          id="usercentrics-cmp"
          src="https://web.cmp.usercentrics.eu/ui/loader.js"
          data-settings-id="RlDaintBne_uoh"
          strategy="lazyOnload"
        />
      </head>

      <body
        className={`${figtree.variable} ${libre.variable} font-sans antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WKVQP2QH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        <QueryProvider>{children}</QueryProvider>

        <Toaster
          expand
          richColors
          position="top-right"
          closeButton
          toastOptions={{
            className:
              "bg-[rgba(81,190,140,0.2)] text-white z-100 top-10 translate-y-10",
          }}
        />
      </body>
    </html>
  );
}
