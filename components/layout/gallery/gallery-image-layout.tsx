"use client";

import React, { useEffect, useRef, useState } from "react";
import ImageItem from "./gallery-image-item";
import { useTranslations } from "next-intl";
import GallerySkeleton from "./skeleton";
import { useGetAllProducts } from "@/features/products/hook";
import { Loader2 } from "lucide-react";

export default function ImageGallery() {
  const t = useTranslations();

  const PAGE_SIZE = 20;

  // page dùng cho API mới
  const [page, setPage] = useState(1);

  // STATE chứa tất cả ảnh đã load
  const [imageGalleryList, setImageGalleryList] = useState<string[]>([]);

  // dùng API mới
  const { data, isLoading, isError, isFetching } = useGetAllProducts({
    page,
    page_size: PAGE_SIZE,
  });

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 🚀 Khi API trả về data → append vào list
  useEffect(() => {
    if (!data) return;

    const newImages =
      data.items?.map((item) => item.static_files?.[0]?.url)?.filter(Boolean) ??
      [];

    setImageGalleryList((prev) => [...prev, ...newImages]);
  }, [data]);

  // 📌 Infinite Scroll
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const lastPage = data?.pagination?.total_pages ?? 1;

        // Khi chạm đáy & còn trang → load tiếp
        if (entries[0].isIntersecting && page < lastPage && !isFetching) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.3 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [data, page, isFetching]);

  /** Responsive columns */
  const getColumns = () =>
    window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 3 : 4;

  const [columns, setColumns] = useState(4);

  useEffect(() => {
    setColumns(getColumns());
    const resize = () => setColumns(getColumns());
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /** Masonry grouping */
  const colArr: string[][] = Array.from({ length: columns }, () => []);
  imageGalleryList.forEach((src, i) => colArr[i % columns].push(src));

  /** Skeleton state */
  if (isLoading && page === 1) return <GallerySkeleton />;

  return (
    <section className="w-full py-12">
      <h2 className="text-2xl font-bold mb-6">{t("imageGallery")}</h2>

      <div className="flex gap-4 w-full">
        {colArr.map((col, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col gap-4 w-full"
          >
            {col.map((src, i) => (
              <ImageItem
                key={colIndex + "-" + i}
                src={src}
                index={i}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Loader trigger */}
      <div
        ref={loadMoreRef}
        className="h-10 w-full flex justify-center items-center"
      >
        {isFetching && <Loader2 className="animate-spin text-secondary" />}
      </div>
    </section>
  );
}
