import type { Metadata } from "next";
import { Figtree, Libre_Caslon_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import QueryProvider from "@/lib/query-provider";
import RuntimeErrorLogger from "@/components/shared/error/runtime-error-logger";
import { TrustedShops } from "@/components/shared/trusted-shop";
import { Providers } from "./providers";
import { BilligerSoluteLanding } from "@/components/shared/billiger/landing";
import WhatsAppChatBox from "@/components/shared/whatsapp-box-chat";

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
    default: "Prestige Home – Qualität für Wohnen & Technik",
    template: "%s | Prestige Home",
  },
  description:
    "Prestige Home bietet hochwertige Möbel, Haushalts- und Technikprodukte für Zuhause und Gewerbe. Qualität, Funktionalität und modernes Design aus einer Hand.",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__APP_VERSION__ = "${process.env.NEXT_PUBLIC_APP_VERSION}";`,
          }}
        />

        <Script
          id="awin-mastertag"
          src="https://www.dwin1.com/121738.js"
          strategy="beforeInteractive"
        />

        <Script
          id="gtm-head"
          strategy="beforeInteractive"
        >
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id=GTM-WSBWFTB5'+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WSBWFTB5');
          `}
        </Script>
        {/* <meta
          name="apple-mobile-web-app-capable"
          content="no"
        /> */}
        <Script
          id="gtag-stub"
          strategy="beforeInteractive"
        >
          {`
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  `}
        </Script>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17706586126"
          strategy="lazyOnload"
        />

        {/* <Script
          id="gtag-base"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17706586126');
                    `}
        </Script> */}
        <Script
          id="gtag-init-safe"
          strategy="afterInteractive"
        >
          {`
    (function () {
      try {
        const run = () => {
          gtag('js', new Date());
          gtag('config', 'AW-17706586126');
        };

        if ('requestIdleCallback' in window) {
          requestIdleCallback(run, { timeout: 3000 });
        } else {
          setTimeout(run, 1500);
        }
      } catch (e) {
        console.warn('gtag init failed safely', e);
      }
    })();
  `}
        </Script>

        <Script
          id="google-ads-conversion-safe"
          strategy="afterInteractive"
        >
          {`
    (function () {
      try {
        const run = () => {
          if (!window.gtag) return;
          gtag('event', 'conversion', {
            'send_to': 'AW-17548008377/U6FbCPzkkqEbELm3xa9B',
            'transaction_id': ''
          });
        };

        if ('requestIdleCallback' in window) {
          requestIdleCallback(run, { timeout: 3000 });
        } else {
          setTimeout(run, 2000);
        }
      } catch (e) {
        console.warn('Ads conversion failed safely', e);
      }
    })();
  `}
        </Script>

        {/* Facebook Pixel */}
        {/* <Script
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
        </Script> */}

        <Script
          id="fb-pixel-safe"
          strategy="afterInteractive"
        >
          {`
    (function () {
      try {
        const run = () => {
          if (window.fbq) return;

          const fbq = function () {
            fbq.callMethod
              ? fbq.callMethod.apply(fbq, arguments)
              : fbq.queue.push(arguments);
          };

          fbq.queue = [];
          fbq.loaded = true;
          fbq.version = '2.0';
          window.fbq = fbq;

          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://connect.facebook.net/en_US/fbevents.js';

          if (document.body) {
            document.body.appendChild(script);
          }

          fbq('init', '1625686318416498');
          fbq('track', 'PageView');
        };

        if ('requestIdleCallback' in window) {
          requestIdleCallback(run, { timeout: 3000 });
        } else {
          setTimeout(run, 1500);
        }
      } catch (e) {
        console.warn('FB Pixel blocked safely', e);
      }
    })();
  `}
        </Script>

        {/* <Script
          id="google-ads-conversion"
          strategy="afterInteractive"
        >
          {`
                        gtag('event', 'conversion', {
                        'send_to': 'AW-17548008377/U6FbCPzkkqEbELm3xa9B',
                        'transaction_id': ''
                        });
                    `}
        </Script> */}

        {/* Usercentrics Autoblocker */}
        {/* <Script
          id="usercentrics-autoblocker"
          src="https://web.cmp.usercentrics.eu/modules/autoblocker.js"
          strategy="beforeInteractive"
        /> */}

        {/* Usercentrics CMP */}
        <Script
          id="usercentrics-cmp"
          src="https://web.cmp.usercentrics.eu/ui/loader.js"
          data-settings-id="RlDaintBne_uoh"
          strategy="afterInteractive"
        />
      </head>

      <body
        className={`${figtree.variable} ${libre.variable} font-sans antialiased`}
      >
        <Providers>
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-WSBWFTB5"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>

          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none", visibility: "hidden" }}
              src="https://www.facebook.com/tr?id=1625686318416498&ev=PageView&noscript=1"
            />
          </noscript>
          <BilligerSoluteLanding />
          <RuntimeErrorLogger />
          <TrustedShops />
          <QueryProvider>{children}</QueryProvider>
        </Providers>

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
