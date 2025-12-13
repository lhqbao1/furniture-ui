import React, { useState } from "react";
import ProductSearch from "./product-search";
import { AlignJustify } from "lucide-react";

import MobileProductSearch from "./mobile-product-search";

import { CartDrawer } from "./cart-drawer";
import { useAtom } from "jotai";
import ListCategoriesHome from "../layout/home/list-categories";
import { expandAllCategoriesAtom } from "@/store/categories-drawer";
import HeaderLogo from "../layout/header/header-logo";
import HeaderCartIcon from "../layout/header/header-cart-icon";
import HeaderUserLogin from "../layout/header/header-user-login";
import { getCategoriesWithChildren } from "@/features/category/api";

const PageHeader = async () => {
  const [openCart, setOpenCart] = useState(false);
  const [, setExpandAll] = useAtom(expandAllCategoriesAtom);

  const categories = await getCategoriesWithChildren().catch(() => []);

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
            <CartDrawer
              openCart={openCart}
              setOpenCart={setOpenCart}
            />
          </div>
          <div className="hidden lg:block relative">
            <HeaderCartIcon />
          </div>
          <HeaderUserLogin />
          <AlignJustify
            className="cursor-pointer hover:scale-110 transition-all duration-300"
            stroke="#4D4D4D"
            size={30}
            onClick={() => setExpandAll(true)}
          />
        </div>
      </div>
      <div className="min-h-16 bg-white lg:px-20 hidden lg:block">
        <ListCategoriesHome categories={categories ?? []} />
      </div>
    </header>
  );
};

export default PageHeader;
