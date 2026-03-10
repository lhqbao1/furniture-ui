import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import "../globals.css";
import { routing } from "@/src/i18n/routing";
import type { Metadata } from "next";
import IntlClientProviderWithAuth from "./intlProviderWithAuth";
import { getMessages } from "next-intl/server";
import LocaleClientBoot from "@/components/shared/locale-client-boot";

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
    description:
      "Prestige Home bietet hochwertige Möbel, Haushalts- und Technikprodukte für Zuhause und Gewerbe.",
    openGraph: {
      locale: locale === "de" ? "de_DE" : locale,
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
      <LocaleClientBoot />

      {/* <SaleFixedIcon /> */}
      {children}
    </IntlClientProviderWithAuth>
  );
}
