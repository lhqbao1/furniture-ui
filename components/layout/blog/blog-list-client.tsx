"use client";

import { useState } from "react";
import BlogCard from "./blog-card-item";
import BlogCardSkeleton from "./blog-card-skeleton";
import { BlogItem } from "@/types/blog";

export default function BlogListClient({
  initialPosts,
  initialPagination,
}: {
  initialPosts: BlogItem[];
  initialPagination: {
    page: number;
    page_size: number;
    total_pages: number;
    total_items: number;
  };
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [pagination, setPagination] = useState(initialPagination);

  const [loading, setLoading] = useState(false);

  const hasMore = pagination.page < pagination.total_pages;

  const loadMore = async () => {
    if (!hasMore) return;

    setLoading(true);

    const nextPage = pagination.page + 1;

    const res = await fetch(
      `/api/blog?page=${nextPage}&page_size=${pagination.page_size}`,
      { cache: "no-store" },
    );
    const data = await res.json();

    setPosts((prev) => [...prev, ...data.items]);

    setPagination(data.pagination);
    setLoading(false);
  };

  return (
    <div className="space-y-10">
      {/* GRID POSTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts.map((post: BlogItem) => (
          <div key={post.id}>
            <BlogCard post={post} />
          </div>
        ))}

        {loading && [...Array(3)].map((_, i) => <BlogCardSkeleton key={i} />)}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="border rounded-md py-2 px-6 hover:bg-gray-100 transition"
          >
            {loading ? "Lädt..." : "Mehr laden"}
          </button>
        </div>
      )}
    </div>
  );
}
