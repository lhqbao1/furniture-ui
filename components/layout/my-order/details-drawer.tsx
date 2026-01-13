import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CheckOut, CheckOutMain } from "@/types/checkout";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/date-formated";
import { InvoiceResponse } from "@/types/invoice";
import Image from "next/image";
import { formatDateToNum } from "@/lib/ios-to-num";
import { getTrackingUrl } from "@/lib/tracking/get-tracking-url";
import { toast } from "sonner";
import { calculateShippingCost } from "@/hooks/caculate-shipping";
import { getCountryLabelDE } from "@/components/shared/getCountryNameDe";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { RouteInvoicePDF } from "../pdf/route-invoice";
import { Loader2 } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "@/src/i18n/navigation";

interface OrderDetailsDrawerProps {
  invoice?: InvoiceResponse;
  checkout: CheckOutMain;
}

const OrderDetailsDrawer = ({ invoice, checkout }: OrderDetailsDrawerProps) => {
  const t = useTranslations("orderDetailsDrawer");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  console.log(checkout);

  const handleNavigateTracking = (checkout: CheckOut) => {
    const url = getTrackingUrl(checkout);

    if (!url) {
      toast.error(t("trackingNotAvailable"));
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={setOpen}
    >
      <Button
        variant="outline"
        type="button"
        onClick={() => setOpen(true)}
      >
        {t("viewDetails")}
      </Button>
      <DrawerContent className="p-6 w-[600px] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[600px] mx-auto overflow-y-auto overflow-x-hidden pointer-events-auto">
        <DialogTitle></DialogTitle>
        <div className="space-y-6 pt-6 pointer-events-auto">
          <div className="border-b pb-6 space-y-4">
            <h2 className="text-2xl font-semibold">
              {t("orderId")}: {checkout.checkout_code}
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <dt className="font-semibold text-xl">{t("orderDate")}</dt>
                <dd className="text-lg">
                  {formatDateToNum(checkout?.created_at ?? new Date())}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-xl">{t("paymentMethod")}</dt>
                <dd className="capitalize text-lg">
                  {checkout.payment_method}
                </dd>
              </div>
            </dl>
          </div>

          {/*List checkout */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">{t("orderProducts")}</h3>
            {checkout.checkouts.map((checkout, index) => {
              return (
                <div
                  className="flex-1 space-y-2 border-b pb-6"
                  key={checkout.id}
                >
                  {/* Delivery info */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-lg min-h-0">
                        {checkout.status === "shipped" ||
                          (checkout.status === "completed" &&
                            t("deliveredOn"))}{" "}
                        {/* {formatDateDE(checkout.updated_at)} */}
                      </p>
                      <p className="text-sm text-gray-600 min-h-0">
                        {t("standardDeliveryBy")}:{" "}
                        {checkout.shipment
                          ? checkout.shipment.shipping_carrier
                          : t("updating")}
                      </p>
                    </div>

                    <button
                      className="text-sm font-semibold underline cursor-pointer"
                      onClick={() => handleNavigateTracking(checkout)}
                    >
                      {t("tracking")}:{" "}
                      {checkout.shipment
                        ? checkout.shipment.tracking_number
                        : t("updating")}
                    </button>
                  </div>

                  {/* Product info */}
                  {checkout.cart.items.map((item, index) => {
                    const product = item.products;
                    return (
                      <div
                        className="pt-2 space-y-1 flex gap-4"
                        key={product.id}
                      >
                        <div>
                          <div>{product.name}</div>
                          <div className="font-semibold text-lg">
                            {product.final_price.toLocaleString("de-DE", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </div>
                          <div className="text-sm text-gray-600 space-y-0.5">
                            {t("articleNumber")}: {product.id_provider}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/*Summary */}
          <div className="space-y-4 border-b pb-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold">{t("totalSummary")}</h3>

              {/* {isDispatched && (
                <Button
                  variant={"outline"}
                  onClick={() => console.log("hehe")}
                ></Button>
              )} */}
              {invoice && (
                <button
                  type="button"
                  className="text-sm font-semibold underline underline-offset-4 hover:opacity-80"
                >
                  <PDFDownloadLink
                    document={<RouteInvoicePDF invoice={invoice} />}
                    fileName={`${invoice.invoice_code}.pdf`}
                  >
                    {({ loading }) =>
                      loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <div className="cursor-pointer">
                          {t("downloadInvoice")}
                        </div>
                      )
                    }
                  </PDFDownloadLink>
                </button>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t("subtotal")}</span>
                <span>
                  {(
                    (invoice?.total_amount_item ?? 0) +
                    (invoice?.total_shipping ?? 0) +
                    (invoice?.voucher_amount ?? 0)
                  ).toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  €
                </span>
              </div>

              <div className="flex justify-between">
                <span>{t("shipping")}</span>
                <span>
                  {" "}
                  {calculateShippingCost(
                    checkout.checkouts
                      .flatMap((c) => c.cart)
                      .flatMap((c) => c.items) ?? [],
                  ).gross?.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  €
                </span>
              </div>
            </div>

            {/* Total */}
            <div>
              <div className="flex justify-between text-lg font-semibold pt-2">
                <span>{t("total")}</span>
                <span>
                  {(
                    (invoice?.total_amount_item ?? 0) +
                    (invoice?.total_shipping ?? 0) +
                    (invoice?.voucher_amount ?? 0)
                  ).toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  €
                </span>
              </div>
              <div className="text-xs text-gray-600">
                {t("totalIncludesVat")}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-8 pb-6">
            {/* Shipping Address */}
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">{t("shippingAddress")}</h3>
              {checkout?.checkouts[0]?.shipping_address && (
                <div className="text-base leading-relaxed">
                  <div>
                    {checkout.checkouts[0].shipping_address.recipient_name}
                  </div>
                  <div>
                    {checkout.checkouts[0].shipping_address.address_line}
                  </div>
                  <div>
                    {checkout.checkouts[0].shipping_address.postal_code}{" "}
                    {checkout.checkouts[0].shipping_address.city}
                  </div>
                  <div>
                    {getCountryLabelDE(
                      checkout.checkouts[0].shipping_address.country,
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Address */}
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">{t("invoiceAddress")}</h3>

              {checkout?.checkouts[0]?.shipping_address && (
                <div className="text-base leading-relaxed">
                  <div>
                    {checkout.checkouts[0].invoice_address.recipient_name}
                  </div>
                  <div>
                    {checkout.checkouts[0].invoice_address.address_line}
                  </div>
                  <div>
                    {checkout.checkouts[0].invoice_address.postal_code}{" "}
                    {checkout.checkouts[0].invoice_address.city}
                  </div>
                  <div>
                    {getCountryLabelDE(
                      checkout.checkouts[0].invoice_address.country,
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DrawerFooter className="p-0">
          <Button
            className="py-6 border-3 border-black rounded-sm"
            variant={"outline"}
            onClick={() => router.push("/contact", { locale })}
          >
            {t("orderHelp")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default OrderDetailsDrawer;
