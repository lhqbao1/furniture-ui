import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CategoriesSkeleton = () => {
  return (
    <div className="w-full flex justify-center py-6">
      <div className="flex gap-x-2 gap-y-2 w-full flex-wrap mx-auto justify-center">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Skeleton key={idx} className="h-6 w-24 rounded-md" />
        ))}
      </div>
    </div>
  );
};

export default CategoriesSkeleton;
