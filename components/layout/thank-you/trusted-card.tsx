"use client";

import Script from "next/script";
import { useEffect } from "react";
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
  useEffect(() => {
    if (!window._ts) return;

    // 1️⃣ Service review (ORDER)
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

    // 2️⃣ Product reviews
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

    // 3️⃣ Trigger Trustcard
    window._ts.push(["_ec.Show"]);
  }, []);

  return (
    <>
      <Script
        src="https://widgets.trustedshops.com/js/XDA9856CEB99C2BDF63BF8E9EF89A20FE.js"
        strategy="afterInteractive"
        onLoad={() => {
          window._ts = window._ts || [];
        }}
      />

      <div id="trustedshops_checkout" />
    </>
  );
}
