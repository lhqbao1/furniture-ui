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
        src="/home-banner11.webp"
        alt="Banner"
        fill
        priority
        fetchPriority="high"
        sizes="(min-width: 1024px) 100vw"
        className="object-cover"
      />

      {isHome && (
        <>
          {/* Overlay (làm mờ / tối) */}
          <div className="absolute inset-0 bg-black/25" />

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div className="max-w-5xl space-y-6 text-white">
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-white">
                {t("hero_title")}
              </h1>

              <p className="text-lg text-white/90">{t("hero_sub")}</p>

              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  className="px-6 py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => router.push("/shop-all", { locale })}
                >
                  {t("exploreNow")}
                </button>
                <button
                  type="button"
                  className="px-6 py-3 border border-white/70 text-white rounded-md hover:bg-white/10 transition cursor-pointer"
                  onClick={() =>
                    router.push("/category/gartenmoebel", { locale })
                  }
                >
                  Bestseller ansehen
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Banner;
