"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { getCategoriesWithChildren } from "@/features/category/api";
import { currentCategoryIdAtom } from "@/store/category";
import { Category, CategoryResponse } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";
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
    <div className="w-full flex justify-center py-6">
      {!categories ? (
        <div>loading</div>
      ) : (
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {categories?.map((item, index) => {
            return (
              <div
                className="px-3 py-1.5 border rounded-full cursor-pointer"
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
