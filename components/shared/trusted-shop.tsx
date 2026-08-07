// components/TrustedShops.tsx
"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

export function TrustedShops() {
  const pathname = usePathname();
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateViewportState = () => setIsDesktopViewport(mediaQuery.matches);

    updateViewportState();
    mediaQuery.addEventListener("change", updateViewportState);

    return () => {
      mediaQuery.removeEventListener("change", updateViewportState);
    };
  }, []);

  // Internal tools should not load storefront trust widgets.
  if (
    !isDesktopViewport ||
    pathname.includes("/admin") ||
    pathname.includes("/affiliate") ||
    pathname.includes("/login") ||
    pathname.includes("/dsp")
  ) {
    return null;
  }

  return (
    <Script
      id="trusted-shops"
      src="//widgets.trustedshops.com/js/XDA9856CEB99C2BDF63BF8E9EF89A20FE.js"
      strategy="lazyOnload"
      async
      data-desktop-position="left"
      data-desktop-custom-width="156"
      data-desktop-disable-reviews="false"
      data-desktop-enable-custom="false"
      data-desktop-enable-fadeout="false"
      data-mobile-position="left"
      data-mobile-custom-width="156"
      data-mobile-disable-reviews="false"
      data-mobile-enable-fadeout="true"
      data-disable-mobile="true"
      data-disable-trustbadge="false"
      data-color-scheme="light"
      charSet="UTF-8"
    />
  );
}
