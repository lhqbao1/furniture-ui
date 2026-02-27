import Image from "next/image";
import { getTranslations } from "next-intl/server";

const logos = [
  { src: "/footer-paypal.png", alt: "PayPal" },
  { src: "/footer-visa.png", alt: "Visa" },
  { src: "/footer-mastercard.png", alt: "Mastercard" },
  { src: "/footer-klarna.png", alt: "Klarna" },
  { src: "/footer-ggpay.png", alt: "Google Pay" },
  { src: "/footer-applepay.png", alt: "Apple Pay" },
];

export default async function HomeLogoStrip() {
  const t = await getTranslations("home_blocks");

  return (
    <section className="section-padding">
      <div className="rounded-2xl border border-black/5 bg-white px-4 py-5 md:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-[var(--font-libre)] text-balance">
            {t("logo_title")}
          </h2>
          <span className="hidden text-xs text-gray-400 md:inline">
            {t("logo_hint")}
          </span>
        </div>
        <div className="mt-4 flex gap-6 overflow-x-auto pb-2">
          {logos.map((logo) => (
            <div
              key={logo.alt}
              className="flex h-12 w-28 flex-none items-center justify-center rounded-full border border-black/5 bg-gray-50 px-4"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={96}
                height={32}
                loading="lazy"
                sizes="112px"
                className="h-6 w-auto object-contain opacity-80"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
