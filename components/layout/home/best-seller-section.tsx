import React from "react";
import { unstable_cache } from "next/cache";
import { getProductByTag } from "@/features/products/api";
import FeaturedProducts from "./featured-products";

const getBestSellerCached = unstable_cache(
  async () =>
    getProductByTag("BEST_SELLER", {
      is_econelo: false,
      is_customer: true,
    }).catch(() => []),
  ["home-best-seller"],
  { revalidate: 600 },
);

const BestSellerSection = async () => {
  const products = await getBestSellerCached();

  return <FeaturedProducts products={products ?? []} />;
};

export default BestSellerSection;
