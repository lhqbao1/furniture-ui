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
      <div
        id="trustedShopsCheckout"
        style={{ display: "none" }}
      >
        <span id="tsCheckoutOrderNr">{orderNumber}</span>
        <span id="tsCheckoutBuyerEmail">{buyerEmail}</span>
        <span id="tsCheckoutOrderAmount">
          {amount.toLocaleString("DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <span id="tsCheckoutOrderCurrency">EUR</span>
        <span id="tsCheckoutOrderPaymentType">{paymentType}</span>
        <span id="tsCheckoutOrderEstDeliveryDate">{estimatedDeliveryDate}</span>

        {products.map((item, index) => {
          return (
            <span className="tsCheckoutProductItem">
              <span className="tsCheckoutProductUrl">{item.url_key ?? ""}</span>
              <span className="tsCheckoutProductImageUrl">
                {item.static_files && item.static_files.length > 0
                  ? item.static_files[0].url
                  : ""}
              </span>
              <span className="tsCheckoutProductName">{item.name}</span>
              <span className="tsCheckoutProductSKU">{item.id_provider}</span>
              <span className="tsCheckoutProductGTIN">{item.ean}</span>
              {/* <span className="tsCheckoutProductMPN">0123456789</span> */}
              <span className="tsCheckoutProductBrand">
                {item.brand ? item.brand.name : "Prestige Home"}
              </span>
            </span>
          );
        })}
      </div>
    </>
  );
}
