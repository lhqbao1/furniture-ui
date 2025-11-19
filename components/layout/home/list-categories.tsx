"use client";
import { getCategoriesWithChildren } from "@/features/category/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const ListCategoriesHome = async () => {
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
                className="px-3 py-1.5 border rounded-full"
                key={index}
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
