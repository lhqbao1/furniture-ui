"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { getCategoriesWithChildren } from "@/features/category/api";
import { currentCategoryIdAtom } from "@/store/category";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import React from "react";

const ListCategoriesHome = () => {
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
        <div className="flex items-center gap-6">
          {categories?.map((item, index) => {
            return (
              <div
                className="px-3 py-1.5 border rounded-full cursor-pointer"
                key={index}
                onClick={() => {
                  setOpen(true);
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
