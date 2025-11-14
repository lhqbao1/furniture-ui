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

        <Script
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
          id="google-ads-conversion"
          strategy="afterInteractive"
        >
          {`
                        gtag('event', 'conversion', {
                        'send_to': 'AW-17548008377/U6FbCPzkkqEbELm3xa9B',
                        'transaction_id': ''
                        });
                    `}
        </Script>

        <Script
          id="usercentrics-autoblocker"
          src="https://web.cmp.usercentrics.eu/modules/autoblocker.js"
          async
        />
        <Script
          id="usercentrics-cmp"
          src="https://web.cmp.usercentrics.eu/ui/loader.js"
          data-settings-id="RlDaintBne_uoh"
          async
          strategy="afterInteractive"
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
