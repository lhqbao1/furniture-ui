"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "product-images", key: "images" },
  { id: "product-price", key: "priceOffer" },
  { id: "product-policy", key: "policy" },
  { id: "product-review-tab", key: "reviews" },
] as const;

export default function ProductQuickNav() {
  const t = useTranslations();
  const [activeId, setActiveId] = React.useState<string>(SECTIONS[0].id);

  const scrollToSection = React.useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    const offset = 72;
    const targetTop =
      target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    const sections = SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-16 z-40 -mx-4 border-b bg-white px-4 lg:hidden">
      <div className="no-scrollbar flex gap-6 overflow-x-auto py-3 text-sm">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 border-transparent pb-1 font-medium text-gray-500 transition-colors",
              activeId === section.id && "border-secondary text-secondary",
            )}
          >
            {t(section.key)}
          </button>
        ))}
      </div>
    </div>
  );
}
