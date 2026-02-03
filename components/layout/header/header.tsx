import React, { Suspense } from "react";
import ProductSearch from "../../shared/product-search";

import MobileProductSearch from "../../shared/mobile-product-search";

import { CartDrawerMobile } from "../cart/cart-drawer";
import ListCategoriesHome from "../home/list-categories";
import HeaderLogo from "./header-logo";
import HeaderCartIcon from "./header-cart-icon";
import HeaderUserLogin from "./header-user-login";
import ExpandDrawer from "./expand-drawer";
import { getCategoriesWithChildren } from "@/features/category/api";
import CategoriesSkeleton from "../home/categories-skeleton";
import { unstable_cache } from "next/cache";

const getHeaderCategories = unstable_cache(
  async () => getCategoriesWithChildren(),
  ["header-categories"],
  { revalidate: 3600 },
);

const CategoriesNav = async () => {
  const categories = await getHeaderCategories();
  return <ListCategoriesHome categories={categories ?? []} />;
};

const PageHeader = () => {
  return (
    <header className="home-banner-top__content sticky top-0 z-50 bg-white shadow-secondary/10 shadow-xl">
      <div className=" flex flex-row gap-4 w-full py-3 items-center px-4 lg:items-center lg:justify-end lg:px-20 lg:py-3 lg:gap-6 border-b">
        <HeaderLogo />
        {/*Product search desktop */}
        <div className="hidden lg:block flex-1">
          <ProductSearch />
        </div>

        <div className="flex h-full items-center justify-end lg:w-fit w-full gap-3 lg:items-end lg:gap-6">
          {/*Mobile Search */}
          <MobileProductSearch />
          {/*Shopping cart */}
          <div className="lg:hidden">
            <CartDrawerMobile />
          </div>
          <div className="hidden lg:block relative">
            <HeaderCartIcon />
          </div>
          <HeaderUserLogin />
          <ExpandDrawer />
        </div>
      </div>
      <div className="min-h-16 bg-white xl:px-20 hidden lg:block">
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesNav />
        </Suspense>
      </div>
    </header>
  );
};

export default PageHeader;
