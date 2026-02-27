import { useTranslations } from "next-intl";
import ContactFormSection from "@/components/layout/contact/contact-form-section";
import { Metadata } from "next";
import ContactInfo from "@/components/layout/contact/contact-info";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktieren Sie Prestige Home für Beratung, Support oder individuelle Anfragen.",
  openGraph: {
    title: "Kontakt",
    description:
      "Nehmen Sie Kontakt mit Prestige Home auf. Wir unterstützen Sie bei allen Fragen rund um Produkte, Bestellungen und Service.",
    url: "https://www.prestige-home.de/de/contact",
    type: "website",
  },
  alternates: {
    canonical: "https://www.prestige-home.de/de/contact",
  },
};

export default function ContactPage() {
  const t = useTranslations();

  return (
    <div className="mt-6 space-y-6">
      <h1 className="section-header space-x-2">
        <span className="text-secondary">{t("contact")}</span>
        <span className="text-primary">Prestige Home</span>
      </h1>
      {/* <ContactInfo /> */}
      <div className="lg:w-2/5 mx-auto section-padding lg:space-y-12 w-full space-y-4">
        <ContactFormSection />
      </div>
    </div>
  );
}
