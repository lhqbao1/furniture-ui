import ImageGallery from "@/components/layout/gallery/gallery-image-layout";
import Script from "next/script";

export const metadata = {
  title: "Galerie | Prestige Home Deutschland",
  description:
    "Entdecken Sie die Prestige Home Galerie mit hochwertigen Bildern und Videos moderner Wohnräume, Einrichtungsideen und exklusiver Interior-Inspirationen.",
  alternates: {
    canonical: "https://www.prestige-home.de/gallery",
  },
  openGraph: {
    title: "Prestige Home Galerie – Bilder & Videos exklusiver Wohnideen",
    description:
      "Durchstöbern Sie unsere Galerie mit hochwertigen Fotos und Videos. Inspirationen für modernes Wohnen, stilvolle Einrichtung und exklusive Interior-Konzepte.",
    url: "https://www.prestige-home.de/gallery",
    siteName: "Prestige Home",
    type: "website",
    locale: "de_DE",
  },
};

// -----------------------------------------

export default function GalleryPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Prestige Home Galerie",
    description:
      "Galerie mit hochwertigen Bildern und Videos moderner Wohnräume, Einrichtungsideen und exklusiven Interior-Inspirationen.",
    url: "https://www.prestige-home.de/gallery",

    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: [
        {
          "@type": "MediaObject",
          name: "Prestige Home Video Galerie",
          description:
            "Videos von Wohninspirationen, Interior-Designs und modernen Einrichtungskonzepten.",
          url: "https://www.prestige-home.de/gallery",
        },
        {
          "@type": "MediaObject",
          name: "Prestige Home Bildergalerie",
          description:
            "Hochwertige Fotos verschiedener Wohnstile, Möbel und Interior-Ideen.",
          url: "https://www.prestige-home.de/gallery",
        },
      ],
    },
  };

  return (
    <>
      {/* JSON-LD Schema für SEO */}
      <Script
        id="prestige-gallery-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* PAGE CONTENT */}
      <section className="bg-white lg:px-64 px-4 py-10">
        {/* video + image gallery components */}
        <ImageGallery />
      </section>
    </>
  );
}
