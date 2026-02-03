"use client";
import { getAllKeywords } from "@/features/products/api";
import { useRouter } from "@/src/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React from "react";

const BlogListKeywordsSkeleton = () => {
  return (
    <div className="border rounded-2xl shadow-xl px-4 py-4 animate-pulse">
      {/* Title skeleton */}
      <div className="h-5 w-48 bg-gray-200 rounded mb-4" />

      {/* Keywords skeleton */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="h-7 w-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
};

const BlogListKeywords = () => {
  const router = useRouter();
  const t = useTranslations();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["keywords"],
    queryFn: getAllKeywords,
  });

  if (isLoading) return <BlogListKeywordsSkeleton />;
  if (!data) return <></>;

  return (
    <div className="border rounded-2xl shadow-xl px-4 py-4">
      <h4 className="text-lg text-primary">{t("people_also_search")}</h4>
      <div className="flex gap-2 flex-wrap">
        {data.slice(0, 20).map((item, index) => {
          return (
            <div
              className="text-sm border rounded-xl px-2 cursor-pointer hover:text-secondary hover:border-secondary transition-all duration-200"
              key={item.keywork + index}
              onClick={() => {
                router.push(`/shop/${item.keywork}`);
              }}
            >
              {item.keywork}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogListKeywords;
