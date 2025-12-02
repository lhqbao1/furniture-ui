"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { currentCategoryIdAtom } from "@/store/category";
import { CategoryResponse } from "@/types/categories";
import { useAtom } from "jotai";
import React from "react";
import { useMediaQuery } from "react-responsive";

interface ListCategoriesHomeProps {
  categories: CategoryResponse[];
}

const ListCategoriesHome = ({ categories }: ListCategoriesHomeProps) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const {
    open: sidebarOpen,
    setOpen,
    openMobile,
    setOpenMobile,
  } = useSidebar();

  const [currentCategoryId, setCurrentCategoryId] = useAtom(
    currentCategoryIdAtom,
  );

  return (
    <div className="w-full flex justify-start py-6">
      {!categories || categories.length === 0 ? (
        <div className="w-full flex justify-start">
          <div className="flex items-center justify-start gap-6 flex-wrap">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-6 w-20 rounded-md"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-start gap-6 flex-wrap">
          {categories?.map((item, index) => {
            return (
              <div
                className="
    cursor-pointer font-medium text-lg relative 
    after:content-[''] after:absolute after:left-0 after:-bottom-1 
    after:h-[2px] after:w-0 after:bg-black after:transition-all 
    after:duration-300 hover:after:w-full
  "
                key={index}
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(true);
                  } else {
                    setOpen(true);
                  }
                  setCurrentCategoryId(item.id);
                }}
              >
                {item.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListCategoriesHome;
