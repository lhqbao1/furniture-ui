"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function GallerySkeleton() {
  const skeletonItems = Array.from({ length: 20 });

  return (
    <div className="flex gap-4 w-full">
      {/* 4 cột desktop – 3 cột tablet – 2 cột mobile */}
      {[...Array(4)].map((_, colIndex) => (
        <div
          key={colIndex}
          className="hidden lg:flex flex-col gap-4 w-full"
        >
          {skeletonItems.slice(colIndex * 5, colIndex * 5 + 5).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full h-[250px] rounded-xl"
            />
          ))}
        </div>
      ))}

      {/* Tablet – 3 columns */}
      {[...Array(3)].map((_, colIndex) => (
        <div
          key={colIndex}
          className="hidden md:flex lg:hidden flex-col gap-4 w-full"
        >
          {skeletonItems.slice(colIndex * 7, colIndex * 7 + 7).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full h-[220px] rounded-xl"
            />
          ))}
        </div>
      ))}

      {/* Mobile – 2 columns */}
      {[...Array(2)].map((_, colIndex) => (
        <div
          key={colIndex}
          className="flex md:hidden flex-col gap-4 w-full"
        >
          {skeletonItems
            .slice(colIndex * 10, colIndex * 10 + 10)
            .map((_, i) => (
              <Skeleton
                key={i}
                className="w-full h-[200px] rounded-xl"
              />
            ))}
        </div>
      ))}
    </div>
  );
}
