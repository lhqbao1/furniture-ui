"use client";

import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CreateOrderFormValues } from "@/lib/schema/checkout";

import { OtpDialog } from "@/components/layout/checkout/otp-dialog";
import BankDialog from "@/components/layout/checkout/bank-dialog";

// 🟢 New Hooks (logic đã tách ra)
import { useCheckoutInit } from "@/hooks/checkout/useCheckoutInit";
import { useCheckoutSubmit } from "@/hooks/checkout/useCheckoutSubmit";
import { cn } from "@/lib/utils";
import CheckOutUserInformation from "@/components/layout/checkout/user-information";
import CheckOutShippingAddress from "@/components/layout/checkout/shipping-address";
// import CheckOutInvoiceAddress from "@/components/layout/checkout/invoice-address";
import CheckoutSummary from "./checkout-summary";
import CheckoutProducts from "./check-out-products";
import CheckoutPaymentUI from "@/components/shared/stripe/payment-ui";
import StripeProvider from "@/components/shared/stripe/stripe";
import StripeLayout from "@/components/shared/stripe/stripe-layout";
import AGBDialogTrigger from "../auth/sign-up/agb-dialog";
import WiderrufDialogTrigger from "../auth/sign-up/widderuf-dialog";

export default function CheckOutFormSection() {
  const t = useTranslations();
  const locale = useLocale();
  const form = useFormContext<CreateOrderFormValues>();

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("checkout_reloaded");
    if (!hasReloaded) {
      sessionStorage.setItem("checkout_reloaded", "true");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, []);

  // -------------------------------
  // 1️⃣ INIT HOOK (user/cart/address/shipping logic)
  // -------------------------------
  const {
    user,
    addresses,
    invoiceAddress,
    cartItems,
    localCart,
    isLoadingCart,
    hasServerCart,
    shippingCost,
    hasOtherCarrier,
    userGuestId,
    userLoginId,
    setUserGuestId,
    setUserLoginId,
    totalAmount,
    finalUserId,
  } = useCheckoutInit();

  // -------------------------------
  // 3️⃣ SUBMIT HOOK (checkout + payment logic)
  // -------------------------------
  const {
    submitting,
    clientSecret,
    total,
    openCardDialog,
    openBankDialog,
    openOtpDialog,
    otpEmail,
    setClientSecret,
    setTotal,
    setOpenCardDialog,
    setOpenBankDialog,
    setOpenOtpDialog,
    handleSubmit,
    handleOTP,
    verifyOtp,
  } = useCheckoutSubmit({
    form,
    user,
    addresses,
    invoiceAddress,
    cartItems,
    localCart,
    hasServerCart,
    shippingCost,
    locale,
    currentUserId: finalUserId ?? "",
  });

  const handleOtpSuccess = (verifiedUserId: string) => {
    setUserLoginId(verifiedUserId);
  };

  const couponAmount = form.watch("coupon_amount");
  const voucherAmount = form.watch("voucher_amount");

  const totalEuro = useMemo(() => {
    const productsTotal =
      cartItems && cartItems.length > 0
        ? cartItems
            .flatMap((g) => g.items)
            .filter((i) => i.is_active)
            .reduce((sum, item) => sum + (item.final_price ?? 0), 0)
        : (localCart ?? [])
            .filter((i) => i.is_active)
            .reduce(
              (sum, item) =>
                sum + (item.item_price ?? 0) * (item.quantity ?? 1),
              0,
            );

    return (
      productsTotal +
      (shippingCost ?? 0) -
      (couponAmount ?? 0) -
      (voucherAmount ?? 0)
    );
  }, [cartItems, localCart, shippingCost, couponAmount, voucherAmount]);

  // Chuyển sang cents cho Stripe
  const totalCents = useMemo(() => {
    return Math.round(totalEuro * 100);
  }, [totalEuro]);

  return (
    <form
      onSubmit={form.handleSubmit(
        (values) => handleOTP(values),
        (error) => {
          const firstKey = Object.keys(error)[0] as keyof typeof error;
          const firstMessage = error[firstKey]?.message;

          toast.error(t("checkFormError"), {
            description: firstMessage,
          });
        },
      )}
      className="flex flex-col gap-8 section-padding"
    >
      <h2 className="section-header">{t("order")}</h2>
      {/* Main container */}
      <div
        className={cn(
          `grid grid-cols-1 xl:grid-cols-3 gap-0 xl:gap-12 md:px-14 xl:px-36 px-4`,
        )}
      >
        {/* Left side */}
        <div className="col-span-1 space-y-4 lg:space-y-12">
          <CheckOutUserInformation />
          <CheckOutShippingAddress key={`shipping-${userLoginId}`} />
          {/* <CheckOutInvoiceAddress key={`invoice-${userId}`} /> */}
        </div>

        {/* Right side */}
        <div className="col-span-2 space-y-4 lg:space-y-4">
          {/* Cart table */}
          <CheckoutProducts
            cartItems={cartItems ?? []}
            isLoadingCart={isLoadingCart}
            localCart={localCart}
          />

          {/* TOTAL + NOTE */}
          <CheckoutSummary
            cartItems={cartItems ?? []}
            localCart={localCart}
            hasOtherCarrier={hasOtherCarrier}
            shippingCost={shippingCost}
          />

          {/* PAYMENT */}
          <div className="space-y-4 py-5 border-y-2">
            {/* ALWAYS SHOW PAYMENT OPTIONS */}
            <CheckoutPaymentUI
              control={form.control}
              selectedMethod={form.watch("payment_method")}
              onChange={(v) => form.setValue("payment_method", v)}
              t={t}
            />
            {clientSecret && (
              <StripeProvider clientSecret={clientSecret}>
                <StripeLayout
                  form={form}
                  clientSecret={clientSecret}
                  setClientSecret={setClientSecret}
                  openDialog={openCardDialog}
                  setOpenDialog={setOpenCardDialog}
                  total={totalCents}
                />
              </StripeProvider>
            )}
          </div>

          {/* TERMS */}
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-row gap-2 mt-4 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormLabel className="text-sm block">
                    {t("agreeTo")} <AGBDialogTrigger t={t} /> {t("and")}{" "}
                    <WiderrufDialogTrigger t={t} /> {t("agree_widderuf")}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* CONTINUE BUTTON */}
          <div className="flex lg:justify-start justify-center mt-2">
            <Button
              type="submit"
              className="text-lg lg:w-1/3 w-1/2 py-6"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                t("placeOrder")
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* OTP + BANK */}
      <OtpDialog
        open={openOtpDialog}
        onOpenChange={setOpenOtpDialog}
        email={otpEmail}
        onSuccess={handleOtpSuccess}
        verifyOtp={verifyOtp}
      />

      <BankDialog
        open={openBankDialog}
        onOpenChange={setOpenBankDialog}
      />
    </form>
  );
}
