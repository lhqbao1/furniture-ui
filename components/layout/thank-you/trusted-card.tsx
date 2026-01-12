"use client";

import Script from "next/script";
import { useRef } from "react";
import { mapTrustedShopsPaymentType } from "@/hooks/map-payment-method";
import { ProductItem } from "@/types/products";

export interface TrustedShopsCheckoutProps {
  orderNumber: string;
  buyerEmail: string;
  amount: number;
  currency: "EUR";
  paymentType: string;
  estimatedDeliveryDate: string;
  products: ProductItem[];
}

export function TrustedShopsCheckout({
  orderNumber,
  buyerEmail,
  amount,
  currency,
  paymentType,
  estimatedDeliveryDate,
  products,
}: TrustedShopsCheckoutProps) {
  const sentRef = useRef(false);

  const sendTrustedShops = () => {
    if (sentRef.current) return;
    sentRef.current = true;

    window._ts = window._ts || [];

    //SERVICE REVIEW (ORDER)
    window._ts.push([
      "_ec.Order",
      {
        order_id: orderNumber,
        order_amount: amount.toFixed(2),
        order_currency: currency,
        order_paymentType: mapTrustedShopsPaymentType(paymentType),
        order_estimatedDeliveryDate: estimatedDeliveryDate,
        email: buyerEmail,
      },
    ]);

    //PRODUCT REVIEWS
    products.forEach((p) => {
      window._ts!.push([
        "_ec.Product",
        {
          id: p.sku,
          name: p.name,
          url: `https://prestige-home.de/de/product/${p.url_key}`,
          imageUrl: p.static_files?.[0]?.url,
          gtin: p.ean,
          brand: p.brand?.name,
        },
      ]);
    });

    //OPEN TRUSTCARD
    window._ts.push(["_ec.Show"]);
  };

  return (
    <>
      {/*INIT QUEUE */}
      <Script
        id="ts-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: "window._ts = window._ts || [];",
        }}
      />

      {/*TRUSTED SHOPS SCRIPT */}
      <Script
        src="https://widgets.trustedshops.com/js/XDA9856CEB99C2BDF63BF8E9EF89A20FE.js"
        strategy="afterInteractive"
        onLoad={sendTrustedShops}
      />

      {/*CONTAINER */}
      <div id="trustedshops_checkout" />
    </>
  );
}
