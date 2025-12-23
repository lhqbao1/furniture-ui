import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import "../globals.css";
import { routing } from "@/src/i18n/routing";
import type { Metadata } from "next";
import WhatsAppChatBox from "@/components/shared/whatsapp-box-chat";
import SaleFixedIcon from "@/components/shared/sale-fixed-icon";
import TawkChat from "@/components/shared/tawk";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return [{ locale: "de" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: `https://www.prestige-home.de/${locale}`,
      languages: {
        de: "https://www.prestige-home.de/de",
        en: "https://www.prestige-home.de/en",
      },
    },
    openGraph: {
      locale,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale}>
      {/* <WhatsAppChatBox /> */ <TawkChat />}
      <SaleFixedIcon />
      {children}
    </NextIntlClientProvider>
  );
}
