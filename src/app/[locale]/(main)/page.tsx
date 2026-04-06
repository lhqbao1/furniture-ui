import CategorySection from "@/components/layout/home/category-section";
import BestSellerSection from "@/components/layout/home/best-seller-section";
import NewsletterVoucherSection from "@/components/layout/home/contact-voucher-section";
import HomeCollectionHighlight from "@/components/layout/home/home-collection-highlight";
import HomeValueProps from "@/components/layout/home/home-value-props";
import type { Metadata } from "next";

import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import DynamicTMTracker from "@/components/shared/tracking/dynamic-tm-tracker";

export const revalidate = 60;
export const experimental_ppr = true;

export const metadata: Metadata = {
  title: "Prestige Home – Qualität für Wohnen & Technik",
  description:
    "Prestige Home bietet hochwertige Möbel, Haushalts- und Technikprodukte für Zuhause und Gewerbe.",
  alternates: {
    canonical: "https://www.prestige-home.de/de",
  },
};

export default async function HomePage() {
  return (
    <div id="home" className="w-full min-h-[200vh] flex flex-col items-center">
      <DynamicTMTracker
        eventId="dynamic_landingpage_de"
        payload={{
          type: "landingpage",
          country: "DE",
        }}
      />
      <div className="md:w-[95%] xl:w-3/4 w-[95%]">
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <BestSellerSection />
        </Suspense>
        <HomeValueProps />
        <HomeCollectionHighlight />
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          {" "}
          <NewsletterVoucherSection />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <CategorySection slug="gartenmoebel" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <CategorySection slug="zaeune-sichtschutz" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          {" "}
          <CategorySection slug="gartenhaeuser" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          {" "}
          <CategorySection slug="verkleidung-vorne" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          {" "}
          <CategorySection slug="ladegeraet" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          {" "}
          <CategorySection slug="sofas" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <CategorySection slug="pflanzenpflege" />
        </Suspense>
      </div>
    </div>
  );
}
