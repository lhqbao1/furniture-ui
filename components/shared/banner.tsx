"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";

interface BannerProps {
  height?: number;
  isHome?: boolean;
}

const Banner = ({ height = 600, isHome = false }: BannerProps) => {
  const [isSticky, setIsSticky] = useState(false);
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    let last = 0;
    const threshold = height;

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

  return (
    <div
      className="relative w-full flex-shrink-0 z-0 hidden lg:block"
      style={{ height }}
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
