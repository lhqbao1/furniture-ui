"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BannerProps {
  height?: number;
}

const Banner = ({ height }: BannerProps) => {
  const [isSticky, setIsSticky] = useState(false);

  // Xử lý scroll (desktop mới cần, mobile ko render banner)
  useEffect(() => {
    const handleScroll = () => {
      const bannerHeight = height || 400;
      setIsSticky(window.scrollY >= bannerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [height]);

  return (
    <div
      className={cn(
        "relative w-full flex-shrink-0 z-0 hidden lg:block", // ẩn ở mobile, hiện ở desktop
        height ? `lg:h-[${height}px]` : "lg:h-[500px]"
      )}
    >
      <Image
        src="/home-banner1.webp"
        alt="Banner"
        fill
        className="object-cover"
        priority
        sizes="100vw"
        unoptimized
      />
    </div>
  );
};

export default Banner;
