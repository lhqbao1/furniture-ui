"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TawkChat() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // ❌ Disable ở admin / dsp
    if (pathname.includes("/admin") || pathname.includes("/dsp")) {
      setEnabled(false);
    } else {
      setEnabled(true);
    }
  }, [pathname]);

  if (!enabled) return null;

  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
    >
      {`
        var Tawk_API = Tawk_API || {};
        var Tawk_LoadStart = new Date();
        (function(){
          var s1 = document.createElement("script"),
              s0 = document.getElementsByTagName("script")[0];
          s1.async = true;
          s1.src = 'https://embed.tawk.to/694a27b56891f4197d337424/1jd4qm7i7';
          s1.charset = 'UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  );
}
