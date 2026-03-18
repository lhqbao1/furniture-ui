import { Metadata } from "next";
import Image from "next/image";
import React from "react";
import ScrollToTop from "@/components/shared/scroll-to-top";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Erfahren Sie mehr über Prestige Home – unsere Geschichte, unsere Mission und wie wir hochwertige, erschwingliche Produkte für Ihr Zuhause anbieten.",
  alternates: {
    canonical: "https://www.prestige-home.de/de/about-us",
  },
  openGraph: {
    title: "Über uns",
    description:
      "Entdecken Sie, wie Prestige Home praktische, stilvolle Produkte für jeden Bereich Ihres Zuhauses anbietet.",
    url: "https://www.prestige-home.de/de/about-us",
    siteName: "Prestige Home",
    locale: "de_DE",
    type: "website",
  },
};

const brandLogos = [
  {
    src: "/p-outdoor.png",
    alt: "Prestige Outdoor",
  },
  {
    src: "/p-indoor.png",
    alt: "Prestige Indoor",
  },
  {
    src: "/p.png",
    alt: "Prestige Home Brand",
  },
  {
    src: "/econelo-logo.png",
    alt: "Econelo",
  },
  {
    src: "/pres-mobility.png",
    alt: "Prestige Mobility",
  },
];

const aboutImageIds = [
  1571463, 1571460, 3932930, 1571458, 6489127, 276724, 7061676, 271743,
  6489125, 7061396,
];

const aboutGallery = aboutImageIds.map((id, index) => ({
  src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`,
  alt: `Prestige Home Einblick ${index + 1}`,
}));

const AboutUsPage = () => {
  return (
    <section className="relative overflow-hidden bg-[#f8f7f4]">
      <ScrollToTop />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="about-orb about-orb-first" />
        <div className="about-orb about-orb-second" />
        <div className="about-orb about-orb-third" />
      </div>

      <div className="section-padding relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="about-fade-up rounded-3xl border border-emerald-100/80 bg-white/90 p-6 shadow-[0_18px_80px_-34px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8 lg:p-10">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Prestige Home
            </span>
            <h1 className="mt-5 text-balance bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl lg:text-6xl">
              Über uns
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Wir glauben, dass ein schönes Zuhause nicht teuer sein muss – es
              braucht nur die richtigen, sorgfältig ausgewählten Stücke.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="about-fade-up about-delay-1 relative h-36 overflow-hidden rounded-2xl sm:h-44 lg:h-52">
              <Image
                src={aboutGallery[0].src}
                alt="Prestige Home Einblick 1"
                fill
                sizes="(max-width: 640px) 50vw, 40vw"
                className="object-cover transition duration-700 hover:scale-105"
              />
            </div>
            <div className="about-fade-up about-delay-2 relative h-36 overflow-hidden rounded-2xl sm:h-44 lg:h-52">
              <Image
                src={aboutGallery[1].src}
                alt="Prestige Home Einblick 2"
                fill
                sizes="(max-width: 640px) 50vw, 40vw"
                className="object-cover transition duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <article className="about-fade-up about-delay-1 rounded-3xl border border-zinc-200/80 bg-white/95 p-6 shadow-[0_24px_60px_-42px_rgba(16,24,40,0.55)] sm:p-8 lg:p-10">
            <div className="space-y-9 text-[1.02rem] leading-8 text-slate-700">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-zinc-950 sm:text-4xl">
                  Hallo, wir sind Prestige Home.
                </h2>
                <p>
                  Wir glauben, dass ein schönes Zuhause nicht teuer sein muss –
                  es braucht nur die richtigen, sorgfältig ausgewählten Stücke.
                </p>
                <p>
                  Von gemütlichen Indoor-Arrangements bis hin zu offenen
                  Gartenecken verdient jeder Raum das Gefühl, Ihr eigener zu
                  sein. Deshalb bieten wir eine sorgfältig kuratierte Auswahl
                  an Produkten für
                  <strong>
                    {" "}
                    Innenbereich, Außenbereich, Garten und Werkzeuge
                  </strong>{" "}
                  – funktional, modern und für den Alltag gemacht.
                </p>
                <p>
                  Bei Prestige Home verkaufen wir nicht einfach Produkte. Wir
                  wählen
                  <strong> praktische und langlebige Lösungen</strong>, die Ihr
                  tägliches Leben erleichtern. Egal, ob Sie eine neue Wohnung
                  einrichten, Ihren Garten auffrischen oder kleine Akzente
                  setzen möchten – wir möchten Ihren Einkauf einfach,
                  transparent und angenehm gestalten.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-zinc-950 sm:text-3xl">
                  Wie wir arbeiten – unser Geschäftsmodell
                </h3>
                <p>
                  Um Ihnen <strong>faire Preise</strong> und eine{" "}
                  <strong>große Produktauswahl</strong>
                  anbieten zu können, arbeiten wir direkt mit{" "}
                  <strong>ausgewählten Herstellern und Lieferpartnern</strong>{" "}
                  zusammen.
                </p>
                <p>
                  Viele unserer Produkte werden{" "}
                  <strong>
                    direkt vom Hersteller an unsere Kunden versendet
                  </strong>
                  . Dadurch entfallen unnötige Zwischenhändler, und wir können
                  Qualität und Preis in Einklang bringen.
                </p>
                <p>
                  Dieses Modell ermöglicht es uns, flexibel zu bleiben, aktuelle
                  Trends anzubieten und gleichzeitig eine zuverlässige
                  Abwicklung sicherzustellen. Selbstverständlich stehen wir
                  Ihnen während des gesamten Bestellprozesses als{" "}
                  <strong>Ihr direkter Ansprechpartner</strong> zur Verfügung –
                  vom Kauf bis zum Kundenservice.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-zinc-950 sm:text-3xl">
                  Eine kurze Geschichte: Von der Idee zu Prestige Home
                </h3>
                <p>
                  Prestige Home entstand aus einer einfachen Idee:{" "}
                  <strong>
                    hochwertige Wohn- und Gartenprodukte für jedermann
                    zugänglich zu machen
                  </strong>
                  .
                </p>
                <p>
                  Wir wollten eine Alternative zum aufwendigen traditionellen
                  Einkauf schaffen und eine Plattform aufbauen, die eine
                  durchdachte Auswahl an funktionalen und stilvollen Produkten
                  bietet – ohne Kompromisse bei Qualität oder Service.
                </p>
                <p>
                  Heute arbeiten wir eng mit unseren Produktions- und
                  Logistikpartnern zusammen, um Ihnen zuverlässige Produkte für
                  Ihr Zuhause zu liefern – transparent, effizient und
                  kundenorientiert.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-zinc-950 sm:text-3xl">
                  Globale Zusammenarbeit: Unsere Partner und Inspiration
                </h3>
                <p>
                  Prestige Home arbeitet mit{" "}
                  <strong>
                    internationalen Herstellern und Produktionspartnern
                  </strong>
                  , insbesondere aus Asien, zusammen, die für ihre{" "}
                  <strong>Qualität, Erfahrung und moderne Fertigung</strong>{" "}
                  bekannt sind.
                </p>
                <p>
                  Alle Produkte werden sorgfältig ausgewählt und geprüft, um
                  unseren Qualitätsansprüchen gerecht zu werden. Durch diese
                  globale Zusammenarbeit können wir{" "}
                  <strong>moderne Designs, praktische Funktionalität</strong>
                  und <strong>attraktive Preise</strong> vereinen – damit Sie
                  Ihr Zuhause nach Ihren eigenen Vorstellungen gestalten können.
                </p>
              </div>
            </div>
          </article>

          <aside className="about-fade-up about-delay-2 space-y-6">
            <div className="rounded-3xl border border-emerald-100 bg-white/95 p-6 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.35)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Was uns auszeichnet
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <p className="rounded-2xl bg-emerald-50 px-4 py-3">
                  Direkte Zusammenarbeit mit Herstellern für faire Preise.
                </p>
                <p className="rounded-2xl bg-amber-50 px-4 py-3">
                  Praktische und langlebige Lösungen für den Alltag.
                </p>
                <p className="rounded-2xl bg-orange-50 px-4 py-3">
                  Zuverlässige Abwicklung mit persönlichem Ansprechpartner.
                </p>
                <p className="rounded-2xl bg-lime-50 px-4 py-3">
                  Moderne Designs für Innen-, Außen- und Gartenbereiche.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white/95 p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.35)] sm:p-6">
              <h3 className="text-xl font-bold text-zinc-950 sm:text-2xl">
                Our Brands
              </h3>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                {brandLogos.map((logo) => (
                  <div
                    key={logo.src}
                    className="group flex h-24 items-center justify-center rounded-xl border border-zinc-100 bg-white p-2 transition duration-500 hover:-translate-y-1 hover:shadow-md"
                  >
                    <Image
                      src={logo.src}
                      width={240}
                      height={130}
                      alt={logo.alt}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="about-fade-up about-delay-3 mt-10 rounded-3xl border border-zinc-200/80 bg-white/95 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.4)] sm:p-8">
          <h3 className="text-center text-2xl font-bold text-zinc-950 sm:text-3xl">
            Einblicke in Prestige Home
          </h3>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {aboutGallery.map((item, index) => (
              <div
                key={item.src}
                className="about-fade-up group relative h-32 overflow-hidden rounded-xl sm:h-36 lg:h-40"
                style={{ animationDelay: `${0.45 + index * 0.08}s` }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsPage;
