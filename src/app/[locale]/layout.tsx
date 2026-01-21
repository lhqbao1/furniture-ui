import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import "../globals.css";
import { routing } from "@/src/i18n/routing";
import type { Metadata } from "next";
import TawkChat from "@/components/shared/tawk";
import IntlClientProviderWithAuth from "./intlProviderWithAuth";
import { getMessages } from "next-intl/server";
import { AuthSanity } from "@/hooks/auth/auth-sanity";
import { AwinTracker } from "@/components/shared/awin-tracker";

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

  const messages = await getMessages();

  return (
    <IntlClientProviderWithAuth
      locale={locale}
      messages={messages} // ✅ BẮT BUỘC
      timeZone="Europe/Berlin"
    >
      <AwinTracker />
      <AuthSanity />
      <TawkChat />
      {/* <SaleFixedIcon /> */}
      {children}
    </IntlClientProviderWithAuth>
  );
}
