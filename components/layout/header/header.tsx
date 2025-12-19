import React from "react";
import ProductSearch from "../../shared/product-search";

import MobileProductSearch from "../../shared/mobile-product-search";

import { CartDrawer } from "../cart/cart-drawer";
import ListCategoriesHome from "../home/list-categories";
import HeaderLogo from "./header-logo";
import HeaderCartIcon from "./header-cart-icon";
import HeaderUserLogin from "./header-user-login";
import ExpandDrawer from "./expand-drawer";
import { getCategoriesWithChildren } from "@/features/category/api";

const PageHeader = async () => {
  const categories = await getCategoriesWithChildren();
  return (
    <header className="home-banner-top__content sticky top-0 overflow-hidden z-50 bg-white shadow-secondary/10 shadow-xl">
      <div className=" flex flex-row gap-4 w-full py-4 items-center px-4 lg:flex lg:items-center lg:justify-end lg:px-20 lg:py-3 lg:gap-6 border-b">
        <HeaderLogo />
        {/*Product search desktop */}
        <div className="hidden lg:block flex-1">
          <ProductSearch />
        </div>

        <div className="flex h-full items-center justify-end w-full lg:w-fit gap-3 lg:items-end lg:gap-6">
          {/*Mobile Search */}
          <div className="block lg:hidden">
            <MobileProductSearch />
          </div>
          {/*Shopping cart */}
          <div className="lg:hidden">
            <CartDrawer />
          </div>
          <div className="hidden lg:block relative">
            <HeaderCartIcon />
          </div>
          <HeaderUserLogin />
          <ExpandDrawer />
        </div>
      </div>
      <div className="min-h-16 bg-white lg:px-20 hidden lg:block">
        <ListCategoriesHome categories={categories ?? []} />
      </div>
    </header>
  );
};

export default PageHeader;
