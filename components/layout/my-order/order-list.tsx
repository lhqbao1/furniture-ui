"use client";

import { getCheckOutMainByUserId } from "@/features/checkout/api";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { MyOrderDataTable } from "./table";
import { useMyOrderTableColumns } from "./columns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/date-formated";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { useRouter } from "@/src/i18n/navigation";
import { userIdAtom } from "@/store/auth";
import { getStatusStyleDe } from "../admin/orders/order-list/status-styles";

import { getInvoiceByUserId } from "@/features/invoice/api";
import OrderDetailsDrawer from "./details-drawer";
import CancelOrderDialog from "./cancel-dialog";
import { OrderListSkeleton } from "./skeleton";
import { Calendar, ChevronRight, PackageCheck, Truck } from "lucide-react";

const parseDateValue = (value?: string | Date | null): Date | null => {
  if (!value) return null;
  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) return directDate;

  const fallback = `${value}Z`;
  const fallbackDate = new Date(fallback);
  if (!Number.isNaN(fallbackDate.getTime())) return fallbackDate;

  return null;
};

const formatDeliveryRangeLabel = (
  fromValue?: string | Date | null,
  toValue?: string | Date | null,
): string => {
  const fromDate = parseDateValue(fromValue);
  const toDate = parseDateValue(toValue);

  if (!fromDate && !toDate) return "-";

  const formatDateLabel = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    });

  if (fromDate && toDate) {
    return `${formatDateLabel(fromDate)} - ${formatDateLabel(toDate)}`;
  }

  return formatDateLabel(fromDate ?? toDate!);
};

const OrderList = () => {
  const [userId] = useAtom(userIdAtom);
  const [, setShowCancelDialog] = useState(false);
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["checkout-user-id", userId],
    queryFn: () => getCheckOutMainByUserId(userId ?? ""),
    enabled: !!userId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: invoice } = useQuery({
    queryKey: ["invoce-by-user-id", userId],
    queryFn: () => getInvoiceByUserId(userId ?? ""),
    retry: false,
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });

  const columns = useMyOrderTableColumns();

  if (isLoadingOrder) {
    return <OrderListSkeleton />;
  }

  if (!order?.length) {
    return (
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-dashed border-secondary/30 bg-white px-6 py-14 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <PackageCheck className="h-7 w-7" />
        </div>
        <p className="text-xl font-semibold text-foreground">
          Keine Bestellungen gefunden
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sobald Sie eine Bestellung aufgeben, erscheint sie hier mit allen
          Liefer- und Rechnungsdetails.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => router.push("/", { locale })}
        >
          Weiter einkaufen
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-2 sm:px-0">
      {order.map((item) => {
        const isPaid = item.status?.toLowerCase() === "paid";
        const isDispatched =
          item.status.toLowerCase() === "shipped" ||
          item.status.toLowerCase() === "completed";
        const statusStyle = getStatusStyleDe(item.status.toLocaleLowerCase());
        const deliveryRangeLabel = formatDeliveryRangeLabel(
          item.delivery_from,
          item.delivery_to,
        );

        return (
          <div key={item.id}>
            <Accordion
              type="single"
              collapsible
              className="w-full overflow-hidden rounded-2xl border border-secondary/20 bg-white shadow-sm"
              defaultValue={order[0]?.id}
            >
              <AccordionItem value={item.id} className="border-b-0">
                <div className="border-b border-secondary/10 bg-gradient-to-r from-secondary/5 via-background to-background">
                  <div className="px-4 py-3 sm:px-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-lg font-semibold text-foreground">
                        {t("orderId")}: {item.checkout_code}
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                          statusStyle.bg,
                          statusStyle.color,
                        )}
                      >
                        {statusStyle.text}
                      </span>
                    </div>

                    <AccordionTrigger className="p-0 hover:no-underline">
                      <div className="grid w-full grid-cols-1 gap-2 text-sm sm:grid-cols-2 sm:gap-4">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 text-secondary" />
                          <span className="font-medium text-foreground">
                            Bestelldatum:
                          </span>
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 text-muted-foreground sm:justify-end">
                          <Truck className="h-4 w-4 text-secondary" />
                          <span className="font-medium text-foreground">
                            Lieferfenster:
                          </span>
                          <span>{deliveryRangeLabel}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                  </div>
                </div>

                <AccordionContent className="flex flex-col gap-4 px-4 py-4 sm:px-5">
                  {item.checkouts
                    .filter((checkout) => {
                      const status = checkout.status?.toLowerCase();
                      return (
                        status !== "exchange" && status !== "cancel_exchange"
                      );
                    })
                    .map((checkoutItem, checkoutIndex) => (
                      <MyOrderDataTable
                        key={`${item.id}-${checkoutItem.id}`}
                        pos={checkoutIndex + 1}
                        columns={columns}
                        data={checkoutItem.cart.items}
                        orderData={checkoutItem}
                      />
                    ))}

                  <div className="rounded-xl border border-secondary/15  px-3 py-3 sm:px-4">
                    <div
                      className={cn(
                        "text-right text-lg font-semibold text-foreground",
                      )}
                    >
                      {t("total")}:{" "}
                      <span className="text-secondary">
                        €
                        {item.total_amount.toLocaleString("de-DE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      {isPaid && (
                        <CancelOrderDialog
                          id={item.id}
                          code={item.checkout_code}
                        />
                      )}

                      {isDispatched && (
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            router.push(`/my-order/${item.id}`, { locale });
                          }}
                        >
                          {t("return")}
                        </Button>
                      )}

                      {isDispatched && (
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setShowCancelDialog(true);
                          }}
                        >
                          {t("buyAgain")}
                        </Button>
                      )}

                      <OrderDetailsDrawer
                        invoice={invoice?.find(
                          (i) => i.main_checkout.id === item.id,
                        )}
                        checkout={item}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );
      })}
    </div>
  );
};

export default OrderList;
