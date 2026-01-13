"use client";
import {
  getCheckOutByUserId,
  getCheckOutMainByUserId,
} from "@/features/checkout/api";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { contactOrderIdAtom } from "@/store/checkout";
import { useRouter } from "@/src/i18n/navigation";
import { userIdAtom } from "@/store/auth";
import { getStatusStyle } from "../admin/orders/order-list/status-styles";
import { canShowCancelButton } from "@/lib/my-order/cancel-button-show";

import {
  getInvoiceByCheckOut,
  getInvoiceByUserId,
} from "@/features/invoice/api";
import OrderDetailsDrawer from "./details-drawer";
import { useCancelMainCheckout } from "@/features/checkout/hook";
import CancelOrderDialog from "./cancel-dialog";

const OrderList = () => {
  const [userId, setUserId] = useAtom(userIdAtom);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const cancelMutation = useCancelMainCheckout();

  const {
    data: order,
    isLoading: isLoadingOrder,
    isError: isErrorOrder,
  } = useQuery({
    queryKey: ["checkout-user-id", userId],
    queryFn: () => getCheckOutMainByUserId(userId ?? ""),
    enabled: !!userId,
    retry: false,
  });

  const {
    data: invoice,
    isLoading: isLoadingInvoice,
    isError: isErrorInvoice,
  } = useQuery({
    queryKey: ["invoce-by-user-id", userId],
    queryFn: () => getInvoiceByUserId(userId ?? ""),
    retry: false,
    enabled: !!userId,
  });

  const columns = useMyOrderTableColumns();

  return (
    <div className="lg:w-1/2 mx-auto space-y-6">
      {order
        // ?.filter(item => item.status !== "Pending")
        ?.map((item, index) => {
          const isPaid = item.status?.toLowerCase() === "paid";
          const isDispatched =
            item.status.toLowerCase() === "shipped" ||
            item.status.toLowerCase() === "completed";
          const canCancel = canShowCancelButton(item.created_at);

          return (
            <div key={index}>
              <Accordion
                type="single"
                collapsible
                className="w-full rounded-md border border-gray-300"
                defaultValue={order[0].id}
              >
                <AccordionItem
                  value={item.id}
                  className="border-b-0"
                >
                  <div
                    className={cn(
                      "border-gray-300 rounded-tr-md rounded-tl-md",
                      getStatusStyle(item.status.toLocaleLowerCase()).bg,
                    )}
                  >
                    <div className="px-2 flex gap-2 items-center">
                      <div className="flex-1">
                        <AccordionTrigger className="flex-1 py-2">
                          <div className="flex justify-between w-full items-center">
                            <div className="text-lg">
                              {t("orderId")}: {item.checkout_code}
                            </div>
                            <div className="text-right">
                              <div>{formatDate(item.created_at)}</div>
                            </div>
                          </div>
                        </AccordionTrigger>
                      </div>
                      {/* <div>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              aria-label="Open menu"
                            >
                              <MoreHorizontalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-40"
                            align="end"
                          >
                            <DropdownMenuLabel className="font-bold border-b">
                              {t("actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuGroup>
                              <DropdownMenuItem>{t("cancel")}</DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => setShowContactDialog(true)}
                              >
                                {t("feedback")}
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Dialog
                          open={showCancelDialog}
                          onOpenChange={setShowCancelDialog}
                        >
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Create New File</DialogTitle>
                              <DialogDescription>
                                Provide a name for your new file. Click create
                                when you&apos;re done.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button type="submit">Create</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={showContactDialog}
                          onOpenChange={setShowContactDialog}
                        >
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>{t("feedback_title")}</DialogTitle>
                              <DialogDescription>
                                {t("feedback_desc")}
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">{t("cancel")}</Button>
                              </DialogClose>
                              <Button
                                onClick={() => {
                                  setContactOrderId(item.id);
                                  router.push("/contact", { locale });
                                  setShowContactDialog(false);
                                }}
                                type="button"
                              >
                                {t("send")}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div> */}
                    </div>
                  </div>
                  <AccordionContent className="flex flex-col gap-4 text-balance px-2 py-3">
                    {item.checkouts
                      .filter((checkout) => {
                        const status = checkout.status?.toLowerCase();
                        return (
                          status !== "exchange" && status !== "cancel_exchange"
                        );
                      })
                      .map((item, index) => {
                        return (
                          <div key={index}>
                            <MyOrderDataTable
                              pos={index + 1}
                              columns={columns}
                              data={item.cart.items}
                              orderData={item}
                            />
                          </div>
                        );
                      })}

                    <div className="px-2 py-2">
                      <div className={cn("text-right text-lg")}>
                        {t("total")}: €
                        {(
                          item.total_amount +
                          item.total_shipping -
                          item.voucher_amount
                        ).toLocaleString("de-DE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="flex justify-center items-center gap-2">
                        {isPaid && (
                          <CancelOrderDialog
                            id={item.id}
                            code={item.checkout_code}
                          />
                        )}

                        {isDispatched && (
                          <Button
                            variant="outline"
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
                            onClick={() => {
                              // mở dialog / gọi API cancel
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
