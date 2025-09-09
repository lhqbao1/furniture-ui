import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import "../globals.css";
import { routing } from "@/src/i18n/routing";

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
    return [{ locale: "de" }, { locale: "en" }];
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params; // this is already a string

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <NextIntlClientProvider locale={locale}>
            {children}
        </NextIntlClientProvider>
    );
}
