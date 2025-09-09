import AnimatedCarousel from "@/components/layout/home/3d-carousel";
import Collection from "@/components/layout/home/collection";
import Custom from "@/components/layout/home/custom";
import FlashSale from "@/components/layout/home/flash-sale";
import PreOrder from "@/components/layout/home/pre-order";
import RecentViewed from "@/components/layout/home/recent-viewed";
import TrendingProducts from "@/components/layout/home/trending";
import Voucher from "@/components/layout/home/voucher";
import { getMe } from "@/features/auth/api";
import { getCartItems } from "@/features/cart/api";
import { getAllProducts, getProductByTag } from "@/features/products/api";
import getQueryClient from "@/lib/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function Home() {
  const queryClient = getQueryClient()

  // Prefetch trending (tag: trending)
  await queryClient.prefetchQuery({
    queryKey: ["product-by-tag"],
    queryFn: () => getProductByTag('Trending'),
  });

  // Prefetch trending products
  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: () => getAllProducts(),
  })

  // Prefetch trending products
  await queryClient.prefetchQuery({
    queryKey: ["cart-items"],
    queryFn: () => getCartItems(),
  })

  // Prefetch trending products
  await queryClient.prefetchQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div id="home" className="w-full">
        <TrendingProducts />
        <AnimatedCarousel />
        <Voucher />
        <FlashSale />
        <PreOrder />
        <RecentViewed />
        <Collection />
        <Custom />
      </div>
    </HydrationBoundary>
  );
}