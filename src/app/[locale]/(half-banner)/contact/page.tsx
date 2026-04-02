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
    <div className="mt-6 space-y-6 section-padding">
      <section className="relative overflow-hidden rounded-3xl border border-[#E6E8EE] bg-gradient-to-br from-[#F8FAFF] via-white to-[#FFF8EF] p-6 md:p-8">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-[#6b7280]">
            Kundenservice
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-[#101828]">
            {t("contact")} <span className="text-primary">Prestige Home</span>
          </h1>
          <p className="max-w-3xl text-sm md:text-base text-[#475467] leading-relaxed">
            Haben Sie Fragen zu Produkten, Lieferung oder Ihrer Bestellung?
            Unser Team hilft Ihnen schnell und zuverlässig weiter.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <ContactInfo />

        <div className="h-full rounded-3xl border border-[#E7EAEF] bg-white p-5 md:p-7 shadow-[0_10px_40px_rgba(20,34,51,0.08)]">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#101828]">
              Nachricht senden
            </h2>
            <p className="mt-2 text-sm text-[#475467]">
              Füllen Sie das Formular aus. Wir melden uns werktags so schnell
              wie möglich zurück.
            </p>
          </div>
          <ContactFormSection />
        </div>
      </div>
    </div>
  );
}
