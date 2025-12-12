"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { currentCategoryIdAtom } from "@/store/category";
import { CategoryResponse } from "@/types/categories";
import { useAtom } from "jotai";
import React from "react";
import { useMediaQuery } from "react-responsive";
import CategoriesDrawer from "../header/categories-drawer";
import { categoryClickedAtom } from "@/store/categories-drawer";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";

interface ListCategoriesHomeProps {
  categories: CategoryResponse[];
}

const ListCategoriesHome = ({ categories }: ListCategoriesHomeProps) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const router = useRouter();
  const locale = useLocale();
  const [currentCategoryId, setCurrentCategoryId] = useAtom(
    currentCategoryIdAtom,
  );
  const [categoryClicked, setCategoryClicked] = useAtom(categoryClickedAtom);

  return (
    <>
      {/* Drawer */}
      <CategoriesDrawer categories={categories} />

      <div className="w-full flex justify-start py-6">
        {!categories || categories.length === 0 ? (
          <div className="flex items-center justify-start gap-6 flex-wrap">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-6 w-20 rounded-md"
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-start gap-6 flex-wrap">
            {categories.map((item) => (
              <div
                key={item.id}
                className="cursor-pointer font-medium text-lg relative 
                after:content-[''] after:absolute after:left-0 after:-bottom-1 
                after:h-[2px] after:w-0 after:bg-black after:transition-all 
                after:duration-300 hover:after:w-full"
                // onClick
                onClick={() => {
                  setCurrentCategoryId(item.id);
                  setCategoryClicked(true); // đánh dấu là user click
                }}
              >
                {item.name}
              </div>
            ))}
            <div
              className="cursor-pointer font-medium text-lg relative 
                after:content-[''] after:absolute after:left-0 after:-bottom-1 
                after:h-[2px] after:w-0 after:bg-black after:transition-all 
                after:duration-300 hover:after:w-full"
              onClick={() => router.push("/blog", { locale })}
            >
              Blog
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ListCategoriesHome;
