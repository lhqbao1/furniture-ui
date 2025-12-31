"use client";

import { useState, use } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getMainCheckOutByMainCheckOutId } from "@/features/checkout/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckOut } from "@/types/checkout";
import { CartItem, CartResponse, CartResponseItem } from "@/types/cart";
import { ProductItem } from "@/types/products";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ReturnItem {
  product_id: string;
  name: string;
  maxQuantity: number;
  price: number;
}

export default function ReturnItemsPage({ params }: PageProps) {
  const { id: checkoutId } = use(params);
  const t = useTranslations();

  const {
    data: checkout,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["checkout-id", checkoutId],
    queryFn: () => getMainCheckOutByMainCheckOutId(checkoutId),
    enabled: !!checkoutId,
  });

  const items: ReturnItem[] =
    checkout?.checkouts
      .flatMap((c: CheckOut) => c.cart)
      .flatMap((c: CartResponseItem) =>
        c.items.map((i: CartItem) => ({
          product_id: i.products.id,
          name: i.products.name,
          maxQuantity: i.quantity,
          price: i.final_price,
        })),
      ) ?? [];

  const [selected, setSelected] = useState<
    Record<string, { quantity: number; reason: string }>
  >({});

  const toggleItem = (item: ReturnItem) => {
    setSelected((prev) => {
      if (prev[item.product_id]) {
        const copy = { ...prev };
        delete copy[item.product_id];
        return copy;
      }

      return {
        ...prev,
        [item.product_id]: {
          quantity: item.maxQuantity, // ✅ mặc định = max
          reason: "",
        },
      };
    });
  };

  const updateQuantity = (productId: string, delta: number, max: number) => {
    setSelected((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: Math.min(max, Math.max(1, prev[productId].quantity + delta)),
      },
    }));
  };

  const handleSubmit = () => {
    const payload = Object.entries(selected).map(([product_id, v]) => ({
      product_id,
      quantity: v.quantity,
      reason: v.reason,
    }));

    console.log("RETURN DATA:", payload);
  };

  const isValid =
    Object.keys(selected).length > 0 &&
    Object.values(selected).every((i) => i.reason);

  if (isLoading) {
    return <div className="text-center py-10">Loading…</div>;
  }

  if (isError || !checkout) {
    return (
      <div className="text-center py-10 text-destructive">
        Failed to load order
      </div>
    );
  }

  return (
    <Card className="lg:w-1/2 mx-auto xl:mt-10 md:mt-6 mt-4">
      <CardHeader>
        <CardTitle className=" text-xl">
          {t("selectItemsToReturn")}:{" "}
          <span className="text-secondary"> {checkout.checkout_code}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {items.map((item) => {
          const value = selected[item.product_id];

          return (
            <div
              key={item.product_id}
              className="space-y-3"
            >
              <div className="space-y-3">
                <div className="flex gap-6 items-center">
                  <Checkbox
                    checked={!!value}
                    onCheckedChange={() => toggleItem(item)}
                  />
                  <div className="flex items-center justify-between flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div>
                      €
                      {item.price.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {value && (
                <div className="ml-6 space-y-3">
                  {/* Quantity */}
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      disabled={value.quantity <= 1}
                      className={
                        value.quantity <= 1
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                      }
                      onClick={() =>
                        updateQuantity(item.product_id, -1, item.maxQuantity)
                      }
                    >
                      −
                    </Button>

                    <span className="font-medium">
                      {value.quantity} / {item.maxQuantity}
                    </span>

                    <Button
                      size="icon"
                      variant="outline"
                      disabled={value.quantity >= item.maxQuantity}
                      className={
                        value.quantity >= item.maxQuantity
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                      }
                      onClick={() =>
                        updateQuantity(item.product_id, 1, item.maxQuantity)
                      }
                    >
                      +
                    </Button>
                  </div>
                  {/* Reason */}
                  <Select
                    value={value.reason}
                    onValueChange={(val) =>
                      setSelected((prev) => ({
                        ...prev,
                        [item.product_id]: {
                          ...prev[item.product_id],
                          reason: val,
                        },
                      }))
                    }
                  >
                    <SelectTrigger
                      placeholderColor
                      className="border"
                    >
                      <SelectValue placeholder={t("selectReason")} />
                    </SelectTrigger>
                    <SelectContent>
                      {RETURN_REASONS.map((r) => (
                        <SelectItem
                          key={r}
                          value={r}
                        >
                          {t(`returnReasons.${r}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />
            </div>
          );
        })}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline">{t("cancel")}</Button>
          <Button
            disabled={!isValid}
            onClick={handleSubmit}
          >
            {t("return")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const RETURN_REASONS = [
  "notAsDescribed",
  "damaged",
  "wrongItem",
  "doesNotFit",
  "damagedOnDelivery",
  "noLongerWanted",
  "deliveredLate",
  "receivedMoreItems",
  "noReason",
];
