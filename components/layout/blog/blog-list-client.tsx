"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import BlogCard from "./blog-card-item";
import BlogCardSkeleton from "./blog-card-skeleton";
import { getBlogs, getBlogsByProductSlug } from "@/features/blog/api";
import { Loader2 } from "lucide-react";
import { startTransition, useMemo } from "react";

export default function BlogListClient({
  initialData,
  productSlug,
}: {
  initialData: any;
  productSlug?: string;
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: productSlug ? ["blogs-product-slug", productSlug] : ["blogs"],
      initialPageParam: 1, // 🔥 BẮT BUỘC
      queryFn: ({ pageParam }) =>
        productSlug
          ? getBlogsByProductSlug({
              product_slug: productSlug,
              page: pageParam,
              page_size: 16,
            })
          : getBlogs({ page: pageParam }),

      getNextPageParam: (lastPage) => {
        const { page, total_pages } = lastPage.pagination;
        return page < total_pages ? page + 1 : undefined;
      },

      initialData, // 👈 phải đúng shape
    });

  const posts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.items ?? []);
  }, [data]);

  const handleLoadMore = () => {
    startTransition(() => {
      fetchNextPage();
    });
  };

  return (
    <div className="space-y-10">
      {/* GRID POSTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts.map((post) => (
          <BlogCard
            key={post.blog_id}
            post={post}
          />
        ))}

        {isFetchingNextPage &&
          [...Array(3)].map((_, i) => <BlogCardSkeleton key={i} />)}
      </div>

      {hasNextPage && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className="inline-flex items-center gap-2 border rounded-md py-2 px-6 hover:bg-gray-100 transition disabled:opacity-60 cursor-pointer"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Lädt...
              </>
            ) : (
              "Mehr laden"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
