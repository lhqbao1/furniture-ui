import type { Metadata } from "next";
import { Figtree, Libre_Caslon_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import QueryProvider from "@/lib/query-provider";

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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17706586126"
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
            gtag('config', 'AW-17706586126');
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
          defer
        />

        {/* Facebook Pixel */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
        >
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '787419114323738'); 
            fbq('track', 'PageView');
          `}
        </Script>
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

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=787419114323738&ev=PageView&noscript=1"
          />
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
