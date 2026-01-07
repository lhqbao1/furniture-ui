"use client";

import { mapTrustedShopsPaymentType } from "@/hooks/map-payment-method";
import { ProductItem } from "@/types/products";
import Script from "next/script";
import React from "react";

export interface TrustedShopsCheckoutProps {
  orderNumber: string;
  buyerEmail: string;
  amount: number;
  currency: "EUR";
  paymentType: string;
  estimatedDeliveryDate: string; // YYYY-MM-DD
  products: ProductItem[];
}

export function TrustedShopsCheckout(props: TrustedShopsCheckoutProps) {
  const {
    orderNumber,
    buyerEmail,
    amount,
    currency,
    paymentType,
    estimatedDeliveryDate,
    products,
  } = props;

  const html = React.useMemo(() => {
    return `
     <div id="trustedShopsCheckout" style="display:none">
      <span id="tsCheckoutOrderNr">${orderNumber}</span>
      <span id="tsCheckoutBuyerEmail">${buyerEmail}</span>
      <span id="tsCheckoutOrderAmount">${amount.toFixed(2)}</span>
      <span id="tsCheckoutOrderCurrency">${currency}</span>
      <span id="tsCheckoutOrderPaymentType">
        ${mapTrustedShopsPaymentType(paymentType)}
      </span>
      <span id="tsCheckoutOrderEstDeliveryDate">${estimatedDeliveryDate}</span>

      ${products
        .map(
          (p) => `
        <span class="tsCheckoutProductItem">
          <span class="tsCheckoutProductUrl">https://prestige-home.de/de/product/${
            p.url_key
          }</span>
          <span class="tsCheckoutProductImageUrl">${
            p.static_files?.[0]?.url ?? ""
          }</span>
          <span class="tsCheckoutProductName">${p.name}</span>
          <span class="tsCheckoutProductSKU">${p.sku}</span>
          ${p.ean ? `<span class="tsCheckoutProductGTIN">${p.ean}</span>` : ""}
          ${
            p.brand?.name
              ? `<span class="tsCheckoutProductBrand">${p.brand.name}</span>`
              : ""
          }
        </span>
      `,
        )
        .join("")}
    </div>
  `;
  }, [
    orderNumber,
    buyerEmail,
    amount,
    currency,
    paymentType,
    estimatedDeliveryDate,
    products,
  ]);

  return (
    <>
      {/* TS script phải load TRƯỚC */}
      <Script
        src="https://widgets.trustedshops.com/js/XXX.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Trusted Shops loaded");
        }}
      />

      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
