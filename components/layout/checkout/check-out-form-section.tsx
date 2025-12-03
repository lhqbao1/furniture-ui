"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { Link, useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";

import { CreateOrderFormValues } from "@/lib/schema/checkout";

import { OtpDialog } from "@/components/layout/checkout/otp-dialog";
import BankDialog from "@/components/layout/checkout/bank-dialog";

// 🟢 New Hooks (logic đã tách ra)
import { useCheckoutInit } from "@/hooks/checkout/useCheckoutInit";
import { useCheckoutSubmit } from "@/hooks/checkout/useCheckoutSubmit";
import { useCartLocal } from "@/hooks/cart";
import { cn } from "@/lib/utils";
import CheckOutUserInformation from "@/components/layout/checkout/user-information";
import CheckOutShippingAddress from "@/components/layout/checkout/shipping-address";
// import CheckOutInvoiceAddress from "@/components/layout/checkout/invoice-address";
import CheckoutSummary from "./checkout-summary";
import CheckoutProducts from "./check-out-products";
import CartTable from "../cart/cart-table";
import CartLocalTable from "../cart/cart-local-table";
import CheckoutPaymentUI from "@/components/shared/stripe/payment-ui";
import CheckoutPaymentLogic from "@/components/shared/stripe/payment-logic";
import StripeProvider from "@/components/shared/stripe/stripe";
import CardDialog from "@/components/shared/stripe/card-pay-dialog";
import StripeLayout from "@/components/shared/stripe/stripe-layout";

// const StripeLayout = dynamic(
//   () => import("@/components/shared/stripe/stripe"),
//   { ssr: false },
// );

// const CheckOutUserInformation = dynamic(
//   () => import("@/components/layout/checkout/user-information"),
//   { ssr: false },
// );

// const CheckOutShippingAddress = dynamic(
//   () => import("@/components/layout/checkout/shipping-address"),
//   { ssr: false },
// );

const CheckOutInvoiceAddress = dynamic(
  () => import("@/components/layout/checkout/invoice-address"),
  { ssr: false },
);

export default function CheckOutFormSection() {
  const t = useTranslations();
  const locale = useLocale();
  const form = useFormContext<CreateOrderFormValues>();
  const [payTrigger, setPayTrigger] = useState<() => Promise<void>>();
  const router = useRouter();

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
    userId,
    userIdLogin,
    setUserIdLogin,
    totalAmount,
  } = useCheckoutInit();

  // -------------------------------
  // 2️⃣ FORM SETUP
  // -------------------------------

  // Pre-fill form values from user/address
  useEffect(() => {
    const defaults: Partial<CreateOrderFormValues> = {};

    if (user) {
      defaults.first_name = user.first_name ?? "";
      defaults.last_name = user.last_name ?? "";
      defaults.email = user.email ?? "";
      defaults.gender = user.gender;
      defaults.company_name = user.company_name ?? "";
      defaults.tax_id = user.tax_id ?? "";
    }

    if (invoiceAddress) {
      defaults.invoice_address_line = invoiceAddress.address_line ?? "";
      defaults.invoice_postal_code = invoiceAddress.postal_code ?? "";
      defaults.invoice_city = invoiceAddress.city ?? "";
      defaults.invoice_address_id = invoiceAddress.id;
    }

    if (addresses && addresses.length > 0) {
      const shippingAddress = addresses.find((a) => a.is_default);
      if (shippingAddress) {
        defaults.shipping_address_line = shippingAddress.address_line ?? "";
        defaults.shipping_postal_code = shippingAddress.postal_code ?? "";
        defaults.shipping_city = shippingAddress.city ?? "";
        defaults.shipping_address_id = shippingAddress.id;
        defaults.phone_number = shippingAddress.phone_number ?? "";
      }
    }

    if (Object.keys(defaults).length > 0)
      form.reset({ ...form.getValues(), ...defaults });
  }, [user, invoiceAddress, addresses]);

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
  });

  const handleOtpSuccess = (verifiedUserId: string) => {
    setUserIdLogin(verifiedUserId);
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
        (values) => handleSubmit(values),
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
          `grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-12 md:px-14 lg:px-36 px-4`,
        )}
      >
        {/* Left side */}
        <div className="col-span-1 space-y-4 lg:space-y-12">
          <CheckOutUserInformation isLogin={!!userIdLogin} />
          <CheckOutShippingAddress key={`shipping-${userId}`} />
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
            {/* <StripeLayout
              clientSecret={clientSecret ?? ""}
              total={total}
              openDialog={openCardDialog}
              setOpenDialog={setOpenCardDialog}
              form={form}
              // userEmail={form.watch("email")}
              // additionalAddress={form.watch("shipping_address_additional")}
              // address={form.watch("shipping_address_line")}
              // city={form.watch("shipping_city")}
              // postalCode={form.watch("shipping_postal_code")}
            /> */}
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
                  <FormLabel className="text-sm flex flex-row">
                    {t("byPlacing")}
                    <Link
                      href={`/agb`}
                      className="text-secondary underline pl-2"
                    >
                      {t("termCondition")}
                    </Link>
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* CONTINUE BUTTON */}
          <div className="flex lg:justify-end justify-center">
            <Button
              type="submit"
              className="text-lg lg:w-1/3 w-1/2 py-6"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                t("continue")
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
      />

      <BankDialog
        open={openBankDialog}
        onOpenChange={setOpenBankDialog}
      />
    </form>
  );
}
