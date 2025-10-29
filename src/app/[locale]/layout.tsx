import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import "../globals.css";
import { routing } from "@/src/i18n/routing";
import type { Metadata } from "next";

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

// 🏗️ Tạo static path cho các ngôn ngữ
export async function generateStaticParams() {
    return [{ locale: "de" }, { locale: "en" }];
}

// ✅ Thêm metadata toàn cục (Organization + Website schema)
export const metadata: Metadata = {
    title: {
        default: "Prestige Home – Elektromobilität & Lifestyle",
        template: "%s | Prestige Home"
    },
    description:
        "Premium E-Scooter, E-Bikes und Elektrofahrzeuge von Prestige Home – Qualität, Design und Nachhaltigkeit vereint.",
    metadataBase: new URL("https://www.prestige-home.de"),
    openGraph: {
        title: "Prestige Home – Elektromobilität & Lifestyle",
        description:
            "Entdecken Sie innovative E-Fahrzeuge und nachhaltige Mobilitätslösungen.",
        url: "https://www.prestige-home.de",
        images: [
            {
                url: "https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/76021c36-bdea-4461-8451-1ebaf92e47c5_banner1.jpeg",
                width: 1200,
                height: 630,
                alt: "Prestige Home",
            },
        ],
    },
    alternates: {
        canonical: "https://www.prestige-home.de",
        languages: {
            de: "https://www.prestige-home.de/de",
            en: "https://www.prestige-home.de/en",
        },
    },
    other: {
        // 🧠 Schema chung cho toàn site
        "application/ld+json": JSON.stringify([
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Prestige Home",
                "url": "https://www.prestige-home.de",
                "logo": "https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/5c38c322-bafc-4e6f-8d14-0c1ba4b7b8de_invoice-logo.png",
                "sameAs": [
                    "https://www.facebook.com/profile.php?id=61578621160298",
                    "https://www.instagram.com/prestige_home_gmbh/",
                    "https://x.com/prestihome_de",
                    "https://www.linkedin.com/company/prestige-home-gmbh/",
                    "https://www.pinterest.com/prestigehomegmbh/"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+49 1520 6576540",
                    "contactType": "Customer Service",
                    "areaServed": "DE",
                    "availableLanguage": ["German", "English"]
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Prestige Home",
                "url": "https://www.prestige-home.de",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.prestige-home.de/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            }
        ]),
    },
};

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <NextIntlClientProvider locale={locale}>
            {children}
        </NextIntlClientProvider>
    );
}
