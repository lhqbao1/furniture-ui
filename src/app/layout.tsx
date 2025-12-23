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
  metadataBase: new URL("https://www.prestige-home.de"),
  title: {
    default: "Prestige Home – Elektromobilität & Lifestyle",
    template: "%s | Prestige Home",
  },
  description:
    "Premium E-Scooter, E-Bikes und Elektrofahrzeuge von Prestige Home – Qualität, Design und Nachhaltigkeit vereint.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  other: {
    "application/ld+json": JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Prestige Home",
        url: "https://www.prestige-home.de",
        logo: "https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/5c38c322-bafc-4e6f-8d14-0c1ba4b7b8de_invoice-logo.png",
        sameAs: [
          "https://www.facebook.com/profile.php?id=61578621160298",
          "https://www.instagram.com/prestige_home_gmbh/",
          "https://x.com/prestihome_de",
          "https://www.linkedin.com/company/prestige-home-gmbh/",
          "https://www.pinterest.com/prestigehomegmbh/",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+49 1520 6576540",
          contactType: "Customer Service",
          areaServed: "DE",
          availableLanguage: ["German", "English"],
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Prestige Home",
        url: "https://www.prestige-home.de",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.prestige-home.de/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ]),
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
            fbq('init', '1625686318416498');
            fbq('track', 'PageView');
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

        {/* <Script
          id="usercentrics-autoblocker"
          src="https://web.cmp.usercentrics.eu/modules/autoblocker.js"
          async
        /> */}
        {/* Tawk.to */}
        <Script
          id="tawk-to"
          strategy="afterInteractive"
        >
          {`
            var Tawk_API = Tawk_API || {};
            var Tawk_LoadStart = new Date();
            (function(){
              var s1 = document.createElement("script"),
                  s0 = document.getElementsByTagName("script")[0];
              s1.async = true;
              s1.src = 'https://embed.tawk.to/694a27b56891f4197d337424/1jd4qm7i7';
              s1.charset = 'UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
        <Script
          id="usercentrics-cmp"
          src="https://web.cmp.usercentrics.eu/ui/loader.js"
          data-settings-id="RlDaintBne_uoh"
          async
          strategy="afterInteractive"
          defer
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

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none", visibility: "hidden" }}
            src="https://www.facebook.com/tr?id=1625686318416498&ev=PageView&noscript=1"
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
