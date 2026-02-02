import { Metadata } from "next";
import Image from "next/image";
import React from "react";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Erfahren Sie mehr über Prestige Home – unsere Geschichte, unsere Mission und wie wir hochwertige, erschwingliche Produkte für Ihr Zuhause anbieten.",
  alternates: {
    canonical: "https://www.prestige-home.de/about-us",
  },
  openGraph: {
    title: "Über uns",
    description:
      "Entdecken Sie, wie Prestige Home praktische, stilvolle Produkte für jeden Bereich Ihres Zuhauses anbietet.",
    url: "https://www.prestige-home.de/about-us",
    siteName: "Prestige Home",
    locale: "de_DE",
    type: "website",
  },
};

const AboutUsPage = () => {
  return (
    <section>
      <div className="section-padding flex flex-col items-center gap-4">
        <h1 className="section-header">Über uns</h1>
        <div className="w-1/2 space-y-4">
          <h3 className="font-bold text-black">
            Hallo, wir sind Prestige Home.
          </h3>
          <p>
            Wir glauben, dass ein schönes Zuhause nicht teuer sein muss – es
            braucht nur die richtigen, sorgfältig ausgewählten Stücke.
          </p>
          <p>
            Von gemütlichen Indoor-Arrangements bis hin zu offenen Gartenecken
            verdient jeder Raum das Gefühl, Ihr eigener zu sein. Deshalb bieten
            wir eine sorgfältig kuratierte Auswahl an Produkten für
            <strong> Innenbereich, Außenbereich, Garten und Werkzeuge</strong> –
            funktional, modern und für den Alltag gemacht.
          </p>
          <p>
            Bei Prestige Home verkaufen wir nicht einfach Produkte. Wir wählen
            <strong> praktische und langlebige Lösungen</strong>, die Ihr
            tägliches Leben erleichtern. Egal, ob Sie eine neue Wohnung
            einrichten, Ihren Garten auffrischen oder kleine Akzente setzen
            möchten – wir möchten Ihren Einkauf einfach, transparent und
            angenehm gestalten.
          </p>
          <h3 className="font-bold text-black">
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
            <strong>direkt vom Hersteller an unsere Kunden versendet</strong>.
            Dadurch entfallen unnötige Zwischenhändler, und wir können Qualität
            und Preis in Einklang bringen.
          </p>
          <p>
            Dieses Modell ermöglicht es uns, flexibel zu bleiben, aktuelle
            Trends anzubieten und gleichzeitig eine zuverlässige Abwicklung
            sicherzustellen. Selbstverständlich stehen wir Ihnen während des
            gesamten Bestellprozesses als{" "}
            <strong>Ihr direkter Ansprechpartner</strong> zur Verfügung – vom
            Kauf bis zum Kundenservice.
          </p>

          <h3 className="font-bold text-black">
            Eine kurze Geschichte: Von der Idee zu Prestige Home
          </h3>
          <p>
            Prestige Home entstand aus einer einfachen Idee:{" "}
            <strong>
              hochwertige Wohn- und Gartenprodukte für jedermann zugänglich zu
              machen
            </strong>
            .
          </p>
          <p>
            Wir wollten eine Alternative zum aufwendigen traditionellen Einkauf
            schaffen und eine Plattform aufbauen, die eine durchdachte Auswahl
            an funktionalen und stilvollen Produkten bietet – ohne Kompromisse
            bei Qualität oder Service.
          </p>
          <p>
            Heute arbeiten wir eng mit unseren Produktions- und Logistikpartnern
            zusammen, um Ihnen zuverlässige Produkte für Ihr Zuhause zu liefern
            – transparent, effizient und kundenorientiert.
          </p>

          <h3 className="font-bold text-black">
            Globale Zusammenarbeit: Unsere Partner und Inspiration
          </h3>
          <p>
            Prestige Home arbeitet mit{" "}
            <strong>internationalen Herstellern und Produktionspartnern</strong>
            , insbesondere aus Asien, zusammen, die für ihre{" "}
            <strong>Qualität, Erfahrung und moderne Fertigung</strong> bekannt
            sind.
          </p>
          <p>
            Alle Produkte werden sorgfältig ausgewählt und geprüft, um unseren
            Qualitätsansprüchen gerecht zu werden. Durch diese globale
            Zusammenarbeit können wir{" "}
            <strong>moderne Designs, praktische Funktionalität</strong>
            und <strong>attraktive Preise</strong> vereinen – damit Sie Ihr
            Zuhause nach Ihren eigenen Vorstellungen gestalten können.
          </p>

          <div className="w-full space-y-6">
            <h3 className="font-bold text-black">Our Brands</h3>
            <div className="grid grid-cols-5 gap-10">
              <Image
                src={"/p-outdoor.png"}
                width={300}
                height={200}
                alt=""
                unoptimized
                className="w-[300px] h-[200px] object-contain"
              />
              <Image
                src={"/p-indoor.png"}
                width={300}
                height={200}
                alt=""
                unoptimized
                className="w-[300px] h-[200px] object-contain"
              />
              <Image
                src={"/p.png"}
                width={300}
                height={200}
                alt=""
                unoptimized
                className="w-[300px] h-[200px] object-contain"
              />

              <Image
                src={"/econelo-logo.png"}
                width={300}
                height={200}
                alt=""
                unoptimized
                className="w-[300px] h-[200px] object-contain"
              />
              <Image
                src={"/pres-mobility.png"}
                width={300}
                height={200}
                alt=""
                unoptimized
                className="w-[300px] h-[200px] object-contain"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 w-2/3 mt-6">
          {Array.from({ length: 8 }, (_, i) => i + 1).map((i) => (
            <Image
              key={i}
              src={`/about/${i}.jpeg`}
              width={230}
              height={230}
              alt=""
              unoptimized
              className="object-cover w-full h-full rounded-sm"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUsPage;
