"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BannerProps {
  height?: number;
}

const Banner = ({ height = 500 }: BannerProps) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    let last = 0;
    const threshold = height ?? 500;

    const handleScroll = () => {
      const now = performance.now();
      if (now - last < 150) return; // throttle 150ms
      last = now;

      const y = window.scrollY;
      const sticky = y >= threshold;

      // tránh setState liên tục khi giá trị không đổi
      setIsSticky((prev) => {
        if (prev === sticky) return prev;
        return sticky;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [height]);

  return (
    <div
      className={cn("relative w-full flex-shrink-0 z-0 hidden lg:block")}
      style={{ height }}
    >
      <Image
        src="/home-banner11.webp"
        alt="Banner"
        fill
        className="object-cover"
        priority // ảnh hero -> improve LCP
        sizes="(min-width: 1024px) 100vw"
        unoptimized
      />
    </div>
  );
};

export default Banner;
