import React from "react";
import OrderPlacedWrapper from "./page-client";
import Script from "next/script";

export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const OrderPlacePage = () => {
  return (
    <>
      {/* Google Ads Conversion Event */}
      <Script
        id="google-ads-conversion-event"
        strategy="afterInteractive"
      >
        {`
          gtag('event', 'ads_conversion_Gi_h_ng_1', {});
        `}
      </Script>

      <OrderPlacedWrapper />
    </>
  );
};

export default OrderPlacePage;
