import AnimatedCarousel from "@/components/layout/home/3d-carousel";
import Banner from "@/components/layout/home/banner";
import Collection from "@/components/layout/home/collection";
import Custom from "@/components/layout/home/custom";
import FlashSale from "@/components/layout/home/flash-sale";
import PreOrder from "@/components/layout/home/pre-order";
import RecentViewed from "@/components/layout/home/recent-viewed";
import TrendingProducts from "@/components/layout/home/trending";
import Voucher from "@/components/layout/home/voucher";

export default function Home() {
  return (
    <div id="home" className="w-full">
      <Banner />
      <TrendingProducts />
      <AnimatedCarousel />
      <Voucher />
      <FlashSale />
      <PreOrder />
      <RecentViewed />
      <Collection />
      <Custom />
    </div>
  );
}
