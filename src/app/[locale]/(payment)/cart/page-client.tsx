"use client";
import React, { useEffect, useState } from "react";
import CartSummary from "@/components/layout/cart/cart-summary";
import { LoginDrawer } from "@/components/shared/login-drawer";

import { CartActions, useCartData } from "@/hooks/cart/useCart";
import { useAtom } from "jotai";
import { authHydratedAtom, userIdAtom } from "@/store/auth";
import CartItemCard from "@/components/layout/cart/cart-item";
import { useTranslations } from "next-intl";
import {
  calculateShipping,
  normalizeCartItems,
} from "@/hooks/caculate-shipping";
import CartTitleSkeleton from "@/components/layout/cart/skeleton/cart-page-heading-skeleton";
import CartItemSkeleton from "@/components/layout/cart/skeleton/cart-item-card-skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import { flattenCartItems } from "@/hooks/cart/flattenCart";
import DynamicTMTracker from "@/components/shared/tracking/dynamic-tm-tracker";
import { calculateProductVAT } from "@/lib/caculate-vat";
import {
  getFirstCategoryName,
  getTrackingId,
  toTrackingCsv,
} from "@/components/shared/tracking/tracking-utils";

const CartPageClient = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userId, setUserId] = useAtom(userIdAtom);
  const isAuthenticated = Boolean(userId);
  const [authHydrated] = useAtom(authHydratedAtom);
  const router = useRouter();
  const t = useTranslations();
  const {
    cart,
    localCart,
    displayedCart,
    isLoadingCart,
    localQuantities,
    setLocalQuantities,
    updateStatus,
    total,
  } = useCartData();

  const { proceedToCheckout } = CartActions({
    userId,
    displayedCart,
    setIsLoginOpen,
  });

  const flatItems = React.useMemo(() => {
    return flattenCartItems(cart ?? []);
  }, [cart]);

  const normalized = React.useMemo(() => {
    const items = userId
      ? (cart?.flatMap((g) => g.items) ?? [])
      : (localCart ?? []);

    return normalizeCartItems(items, isAuthenticated);
  }, [cart, localCart, isAuthenticated]);

  const shippingCost = normalized?.length
    ? (calculateShipping(normalized) ?? 0)
    : 0;

  const basketTrackingPayload = React.useMemo(() => {
    const lineItems = userId
      ? flatItems
          .filter((item) => item?.is_active)
          .map((item) => {
            const product = item?.products;
            const categoryName = getFirstCategoryName(product?.categories);
            const quantity = Math.max(0, Number(item?.quantity) || 0);
            const unitGross = Math.max(0, Number(item?.item_price) || 0);
            const unitNet = Number(
              calculateProductVAT(unitGross, product?.tax).net,
            );
            const lineNet = quantity * (Number.isFinite(unitNet) ? unitNet : 0);

            return {
              productId: getTrackingId(product?.id_provider, product?.id),
              productName:
                typeof product?.name === "string"
                  ? product.name
                  : "",
              quantity,
              lineAmount: lineNet,
              category: categoryName,
            };
          })
      : (localCart ?? [])
          .filter((item) => item?.is_active)
          .map((item) => {
            const quantity = Math.max(0, Number(item?.quantity) || 0);
            const unitNet = Math.max(0, Number(item?.item_price) || 0);
            const lineNet = quantity * unitNet;

            return {
              productId: getTrackingId(item?.id_provider, item?.product_id),
              productName:
                typeof item?.product_name === "string" ? item.product_name : "",
              quantity,
              lineAmount: lineNet,
              category: "",
            };
          });

    const normalizedLineItems = lineItems.filter(
      (item) =>
        typeof item.productId === "string" && item.productId.trim().length > 0,
    );

    const productIds = toTrackingCsv(
      normalizedLineItems.map((item) => item.productId),
    );
    const productNames = toTrackingCsv(
      normalizedLineItems.map((item) => item.productName),
    );
    const amounts = toTrackingCsv(
      normalizedLineItems.map((item) => item.lineAmount.toFixed(2)),
    );
    const quantities = toTrackingCsv(
      normalizedLineItems.map((item) => String(item.quantity)),
    );
    const categories = toTrackingCsv(
      normalizedLineItems.map((item) => item.category),
    );
    const levelValues = toTrackingCsv(normalizedLineItems.map(() => "product"));
    const totalAmount = lineItems.reduce(
      (sum, item) => sum + item.lineAmount,
      0,
    );
    const totalQuantity = lineItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      type: "basket",
      country: "DE",
      productids: productIds,
      productnames: productNames,
      amounts,
      quantities,
      categories,
      levelvalues: levelValues,
      currency: "EUR",
      amount: totalAmount.toFixed(2),
      quantity: String(totalQuantity),
    };
  }, [userId, flatItems, localCart]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="mt-6 md:pb-0 pb-6 lg:px-0 px-4 container-padding overflow-auto">
      <DynamicTMTracker
        enabled={authHydrated && !(userId && isLoadingCart)}
        payload={basketTrackingPayload}
      />
      <div className="w-full lg:max-w-7xl mx-auto lg:p-6">
        <Button
          variant={"outline"}
          className="mb-2 lg:hidden"
          onClick={() => router.back()}
        >
          {t("back")} <ArrowLeft />
        </Button>
        <div className="grid grid-cols-12 lg:gap-16 gap-6">
          {/* Left: Cart Items */}
          <div className="col-span-12 md:col-span-7">
            {/* CART TITLE */}
            {!authHydrated || (userId && isLoadingCart) ? (
              <CartTitleSkeleton />
            ) : (
              <h3 className="text-3xl font-normal">
                Warenkorb{" "}
                <span className="mb-6 capitalize">
                  (
                  {userId
                    ? (cart?.reduce((acc, g) => acc + g.items.length, 0) ?? 0)
                    : localCart.length}{" "}
                  <span className="capitalize">{t("items")}</span>)
                </span>
              </h3>
            )}

            <div className="mt-2 md:mt-8 lg:mt-12">
              {!authHydrated || (userId && isLoadingCart) ? (
                <CartItemSkeleton count={2} />
              ) : userId ? (
                flatItems.map((item) => (
                  <CartItemCard cartServer={item} key={item.id} />
                ))
              ) : (
                localCart.map((item) => (
                  <CartItemCard localProducts={item} key={item.product_id} />
                ))
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="col-span-12 md:col-span-5">
            <CartSummary
              total={total}
              onCheckout={proceedToCheckout}
              cart={cart}
              shipping={shippingCost}
              userId={userId ?? ""}
              authHydrated={authHydrated}
            />
          </div>
        </div>
      </div>
      <LoginDrawer
        openLogin={isLoginOpen}
        setOpenLogin={setIsLoginOpen}
        isCheckOut
        setUserId={setUserId}
      />
    </div>
  );
};

export default CartPageClient;
