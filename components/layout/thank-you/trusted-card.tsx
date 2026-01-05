"use client";

import { ProductItem } from "@/types/products";

interface TrustedShopsCheckoutProps {
  orderNumber: string;
  buyerEmail: string;
  amount: number;
  currency: "EUR";
  paymentType: string;
  estimatedDeliveryDate: string; // YYYY-MM-DD
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
  return (
    <div
      id="trustedShopsCheckout"
      style={{ display: "none" }} // ❗ BẮT BUỘC
    >
      <span id="tsCheckoutOrderNr">{orderNumber}</span>
      <span id="tsCheckoutBuyerEmail">{buyerEmail}</span>
      <span id="tsCheckoutOrderAmount">{amount.toFixed(2)}</span>
      <span id="tsCheckoutOrderCurrency">{currency}</span>
      <span id="tsCheckoutOrderPaymentType">{paymentType}</span>
      <span id="tsCheckoutOrderEstDeliveryDate">{estimatedDeliveryDate}</span>

      {/* 🔹 Product reviews */}
      {products.map((product, index) => (
        <span
          className="tsCheckoutProductItem"
          key={index}
        >
          <span className="tsCheckoutProductUrl">{`https://prestige-home.de/de/product/${product.url_key}`}</span>
          <span className="tsCheckoutProductImageUrl">
            {product.static_files[0].url}
          </span>
          <span className="tsCheckoutProductName">{product.name}</span>
          <span className="tsCheckoutProductSKU">{product.sku}</span>

          {product.ean && (
            <span className="tsCheckoutProductGTIN">{product.ean}</span>
          )}

          {product.brand && (
            <span className="tsCheckoutProductBrand">{product.brand.name}</span>
          )}
        </span>
      ))}
    </div>
  );
}
