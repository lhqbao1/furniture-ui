"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";

interface BannerProps {
  height?: number;
  isHome?: boolean;
}

const Banner = ({ height, isHome = false }: BannerProps) => {
  const [isSticky, setIsSticky] = useState(false);
  const pathname = usePathname();
  const isMobile = useMediaQuery({ maxWidth: 640 });

  // 👉 Điều kiện ẩn banner
  const hideBanner = isMobile && pathname.includes("/product");

  useEffect(() => {
    let last = 0;
    const threshold = height ?? 0;

    const handleScroll = () => {
      const now = performance.now();
      if (now - last < 150) return;
      last = now;

      const sticky = window.scrollY >= threshold;
      setIsSticky((prev) => (prev === sticky ? prev : sticky));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [height]);

  if (hideBanner) return null;

  return (
    <div
      className="relative w-full flex-shrink-0 z-0 h-[200px] lg:h-[300px] 2xl:h-[600px] block"
      style={height ? { height: `${height}px` } : undefined}
    >
      {/* Background image */}
      <Image
        src="/home.jpg"
        alt="Banner"
        fill
        priority
        fetchPriority="high"
        // sizes="(min-width: 1024px) 100vw"
        className="object-cover"
        unoptimized
      />
    </div>
  );
};

export default Banner;
