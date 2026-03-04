import CategorySection from "@/components/layout/home/category-section";
import BestSellerSection from "@/components/layout/home/best-seller-section";
import NewsletterVoucherSection from "@/components/layout/home/contact-voucher-section";
import HomeCollectionHighlight from "@/components/layout/home/home-collection-highlight";
import HomeValueProps from "@/components/layout/home/home-value-props";

import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";

export const revalidate = 60;
export const experimental_ppr = true;

export default async function HomePage() {
  return (
    <div id="home" className="w-full min-h-[200vh] flex flex-col items-center">
      <div className="md:w-[95%] xl:w-3/4 w-[95%]">
        <h1 className="sr-only">Prestige Home</h1> {/* CRITICAL FIRST PAINT */}
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
          {" "}
          <CategorySection slug="spielzeug" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          {" "}
          <CategorySection slug="sofas" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <CategorySection slug="matratzen" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <CategorySection slug="gartenmoebel" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <CategorySection slug="zaeune-sichtschutz" />
        </Suspense>
      </div>
    </div>
  );
}
