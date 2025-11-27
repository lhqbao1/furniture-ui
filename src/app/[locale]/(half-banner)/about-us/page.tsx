import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Über uns | Prestige Home",
  description:
    "Erfahren Sie mehr über Prestige Home – unsere Geschichte, unsere Mission und wie wir hochwertige, erschwingliche Produkte für Ihr Zuhause anbieten.",
  alternates: {
    canonical: "https://www.prestige-home.de/about-us",
  },
  openGraph: {
    title: "Über uns | Prestige Home",
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
    <div className="section-padding flex flex-col items-center gap-4">
      <h1 className="section-header">Über uns</h1>
      <div className="w-1/2 space-y-4">
        <h3 className="font-bold text-black">Hallo, wir sind Prestige Home.</h3>
        <p>
          Wir glauben, dass ein schönes Zuhause nicht teuer sein muss – es
          braucht nur die richtigen, sorgfältig ausgewählten Stücke.
        </p>
        <p>
          Von gemütlichen Indoor-Arrangements bis hin zu offenen Gartenecken
          verdient jeder Raum das Gefühl, Ihr eigener zu sein. Deshalb bieten
          wir eine sorgfältig ausgewählte Palette von Produkten für den
          Innenbereich, den Außenbereich, den Garten und Werkzeuge – direkt von
          vertrauenswürdigen Herstellern bezogen. Einfach, modern und für das
          echte Leben gemacht.
        </p>
        <p>
          Bei Prestihome verkaufen wir nicht nur Möbel oder Werkzeuge – wir
          bringen Ihnen praktische Stücke, die Ihr tägliches Leben unterstützen.
          Egal, ob Sie eine neue Wohnung einrichten, Ihren Garten auffrischen
          oder kleine Akzente setzen, die sich wie „Sie“ anfühlen, wir sind
          hier, um es Ihnen einfach und angenehm zu machen.
        </p>
        <h3 className="font-bold text-black">
          Lassen Sie uns Ihre Version von Zuhause schaffen – Ecke für Ecke.
        </h3>
        <p>Eine kurze Geschichte: Von der Idee zu Prestige Home</p>
        <p>
          Prestige Home entstand aus einer einfachen Idee – Wohnutensilien für
          jedermann zugänglich und erschwinglich zu machen. Müde vom Aufwand des
          traditionellen Einkaufens, machten wir es uns zur Aufgabe, eine
          kuratierte Auswahl an praktischen, stilvollen Produkten für jede Ecke
          Ihres Zuhauses anzubieten.
        </p>
        <p>
          Heute arbeitet unser Team mit vertrauenswürdigen Herstellern zusammen,
          um Ihnen hochwertige Produkte für den Innenbereich, den Außenbereich,
          den Garten und Werkzeuge anzubieten, damit Sie ein Zuhause schaffen
          können, das Ihren einzigartigen Stil widerspiegelt.
        </p>
        <h3 className="font-bold text-black">
          Globale Zusammenarbeit: Unsere Partner und Inspiration
        </h3>
        <p>
          Bei Prestige Home arbeiten wir mit globalen Herstellern zusammen, um
          Ihnen hochwertige, erschwingliche Produkte für jeden Bereich Ihres
          Zuhauses – Innenbereich, Außenbereich, Garten & Werkzeuge –
          anzubieten. Wir kombinieren moderne Designs mit praktischer
          Funktionalität, um Ihnen zu helfen, einen Raum zu schaffen, der Ihrem
          Lebensstil entspricht.
        </p>
        <p>
          Durch die Zusammenarbeit mit vertrauenswürdigen Marken und Unternehmen
          aus Asien stellen wir sicher, dass jedes Produkt Ihre Bedürfnisse
          erfüllt und gleichzeitig Ihr Budget schont.
        </p>
      </div>
    </div>
  );
};

export default AboutUsPage;
