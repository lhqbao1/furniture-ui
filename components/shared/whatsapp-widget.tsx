"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function WhatsappWidget() {
  const pathname = usePathname();

  // Không load trong admin
  if (pathname.includes("/admin")) return null;

  return (
    <Script
      id="whatsapp-widget"
      strategy="afterInteractive"
    >
      {`
        (function () {
          var options = {
            whatsapp: "+84889835259",
            call_to_action: "Chatten Sie mit uns!",
            position: "right",
          };
          var proto = document.location.protocol,
            host = "getbutton.io",
            url = proto + "//static." + host;
          var s = document.createElement("script");
          s.type = "text/javascript";
          s.async = true;
          s.src = url + "/widget-send-button/js/init.js";
          s.onload = function () {
            WhWidgetSendButton.init(host, proto, options);
          };
          var x = document.getElementsByTagName("script")[0];
          x.parentNode.insertBefore(s, x);
        })();
      `}
    </Script>
  );
}
