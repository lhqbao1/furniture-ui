"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { getCategoriesWithChildren } from "@/features/category/api";
import { currentCategoryIdAtom } from "@/store/category";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import React from "react";
import { useMediaQuery } from "react-responsive";

const ListCategoriesHome = () => {
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

  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories-with-children"],
    queryFn: () => getCategoriesWithChildren(),
    retry: false,
  });

  return (
    <div className="w-full flex justify-center py-6">
      {isLoading || isError || !categories ? (
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
