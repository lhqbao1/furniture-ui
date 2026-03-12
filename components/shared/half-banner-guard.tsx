"use client";

import Banner from "@/components/shared/banner";
import { usePathname } from "next/navigation";

interface HalfBannerGuardProps {
  height?: number;
}

const PRODUCT_PATH_REGEX = /\/product(\/|$)/;

export default function HalfBannerGuard({ height }: HalfBannerGuardProps) {
  const pathname = usePathname() ?? "";
  const isProductPath = PRODUCT_PATH_REGEX.test(pathname);

  if (!isProductPath) {
    return <Banner height={height} />;
  }

  return (
    <div className="hidden md:block">
      <Banner height={height} />
    </div>
  );
}
