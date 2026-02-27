import CategorySection from "@/components/layout/home/category-section";
import NewsletterVoucherSection from "@/components/layout/home/contact-voucher-section";
import FeaturedProducts from "@/components/layout/home/featured-products";
import HomeCollectionHighlight from "@/components/layout/home/home-collection-highlight";
import HomeLogoStrip from "@/components/layout/home/home-logo-strip";
import HomeValueProps from "@/components/layout/home/home-value-props";

import { getProductByTag } from "@/features/products/api";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { unstable_cache } from "next/cache";

export const revalidate = 60;
export const experimental_ppr = true;

export default async function HomePage() {
  const getBestSellerCached = unstable_cache(
    async () =>
      getProductByTag("BEST_SELLER", {
        is_econelo: undefined,
        is_customer: true,
      }).catch(() => []),
    ["home-best-seller"],
    { revalidate: 600 },
  );

  const [cachedBestSeller] = await Promise.all([getBestSellerCached()]);
  const allProducts =
    cachedBestSeller && cachedBestSeller.length > 0
      ? cachedBestSeller
      : await getProductByTag("BEST_SELLER", {
          is_econelo: undefined,
          is_customer: true,
        }).catch(() => []);

  return (
    <div id="home" className="w-full min-h-[200vh] flex flex-col items-center">
      <div className="md:w-[95%] xl:w-3/4 w-[95%]">
        <h1 className="sr-only">Prestige Home</h1> {/* CRITICAL FIRST PAINT */}
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <FeaturedProducts products={allProducts.slice(0, 8)} />
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
