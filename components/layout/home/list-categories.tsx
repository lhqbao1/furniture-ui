"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { currentCategoryIdAtom } from "@/store/category";
import { categoryClickedAtom } from "@/store/categories-drawer";
import { CategoryResponse } from "@/types/categories";
import { useAtom } from "jotai";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { useMediaQuery } from "react-responsive";
import CategoriesDrawer from "../header/categories-drawer";

interface ListCategoriesHomeProps {
  categories: CategoryResponse[];
}

const ListCategoriesHome = ({ categories }: ListCategoriesHomeProps) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  if (isMobile) {
    return <CategoriesDrawer categories={categories} />;
  }

  return (
    <div className="w-full flex justify-center py-6 relative">
      {!categories || categories.length === 0 ? (
        <div className="flex gap-6 flex-wrap">
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-6 w-20 rounded-md"
            />
          ))}
        </div>
      ) : (
        <NavigationMenu viewport={isMobile}>
          <NavigationMenuList className="gap-x-2 gap-y-2 w-[90%] xl:w-full flex-wrap mx-auto">
            {categories.map((category) => (
              <NavigationMenuItem key={category.id}>
                <NavigationMenuTrigger className="uppercase bg-transparent font-semibold text-sm hover:bg-transparent data-[state=open]:bg-transparent cursor-pointer px-2">
                  <Link
                    href={`/category/${category.slug}`}
                    locale={locale}
                    className="uppercase bg-transparent font-semibold text-sm px-2 py-2"
                  >
                    {category.name}
                  </Link>
                </NavigationMenuTrigger>

                {category.children?.length > 0 && (
                  <NavigationMenuContent className="rounded-sm border-none ring-0 z-50">
                    <div className="min-w-[200px]">
                      {category.children.map((child) => (
                        <NavigationMenuLink
                          key={child.id}
                          onClick={() => {
                            // setCurrentCategoryId(child.id);
                            // setCategoryClicked(true);
                            router.push(`/category/${child.slug}`, { locale });
                          }}
                          className="
                          relative cursor-pointer px-2 py-2 text-sm
                          after:content-['']
                          after:absolute after:left-0 after:bottom-0
                          after:h-[2px] after:w-full
                          after:origin-left after:scale-x-0
                          after:bg-secondary
                          after:transition-transform after:duration-300 after:ease-out
                          hover:after:scale-x-100 hover:bg-transparent w-fit
                        "
                        >
                          {child.name}
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                )}
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="uppercase bg-transparent font-semibold text-sm hover:bg-transparent data-[state=open]:bg-transparent cursor-pointer px-2 py-1 focus:bg-transparent"
              >
                <Link href="/shop-all">{t("shopAll")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="uppercase bg-transparent font-semibold text-sm hover:bg-transparent data-[state=open]:bg-transparent cursor-pointer px-2 py-1 focus:bg-transparent"
              >
                <Link href="/about-us">{t("aboutUs")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="uppercase bg-transparent font-semibold text-sm hover:bg-transparent data-[state=open]:bg-transparent cursor-pointer px-2 py-1 focus:bg-transparent"
              >
                <Link href="/contact">{t("contact")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}
      <CategoriesDrawer categories={categories} />
    </div>
  );
};

export default ListCategoriesHome;
