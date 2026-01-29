"use client";
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
  return (
    <>
      <div
        id="trustedShopsCheckout"
        style={{ display: "none" }}
      >
        <span id="tsCheckoutOrderNr">{orderNumber}</span>
        <span id="tsCheckoutBuyerEmail">{buyerEmail}</span>
        <span id="tsCheckoutOrderAmount">{amount.toFixed(2)}</span>
        <span id="tsCheckoutOrderCurrency">EUR</span>
        <span id="tsCheckoutOrderPaymentType">{paymentType}</span>
        <span id="tsCheckoutOrderEstDeliveryDate">{estimatedDeliveryDate}</span>

        {products.map((item, index) => {
          return (
            <span
              className="tsCheckoutProductItem"
              key={item.id_provider ?? index}
            >
              <span className="tsCheckoutProductUrl">
                {item.url_key
                  ? `https://prestige-home.de/de/product/${item.url_key}`
                  : ""}
              </span>
              <span className="tsCheckoutProductImageUrl">
                {item.static_files && item.static_files.length > 0
                  ? item.static_files[0].url
                  : ""}
              </span>
              <span className="tsCheckoutProductName">{item.name}</span>
              <span className="tsCheckoutProductSKU">{item.id_provider}</span>
              {item.ean && (
                <span className="tsCheckoutProductGTIN">{item.ean}</span>
              )}
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
