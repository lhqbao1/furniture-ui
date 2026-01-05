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
      <div id="trustedShopsCheckout" style="display: none;">
<span id="tsCheckoutOrderNr">2020-05-21-001</span>
<span id="tsCheckoutBuyerEmail">mein.kunde@mail.de</span>
<span id="tsCheckoutOrderAmount">1.01</span>
<span id="tsCheckoutOrderCurrency">EUR</span>
<span id="tsCheckoutOrderPaymentType">VORKASSE</span>
<span id="tsCheckoutOrderEstDeliveryDate">2020-05-24</span>

<!-- product reviews start -->
 <!-- for each product in the basket full set of data is required -->
 <span class="tsCheckoutProductItem">
 <span class="tsCheckoutProductUrl">http://www.shop.url/product_page.html</span>
 <span class="tsCheckoutProductImageUrl">http://www.shop.url/image.png</span>
 <span class="tsCheckoutProductName">Product Name</span>
 <span class="tsCheckoutProductSKU">0123456789</span>
 <span class="tsCheckoutProductGTIN">0123456789</span>
 <span class="tsCheckoutProductMPN">0123456789</span>
 <span class="tsCheckoutProductBrand">My Great Brand</span>
 </span>
 <!-- product reviews end -->
</div>

      <OrderPlacedWrapper />
    </>
  );
};

export default OrderPlacePage;
