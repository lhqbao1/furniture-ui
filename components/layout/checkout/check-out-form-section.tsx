"use client";

import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { toast } from "sonner";

import { CreateOrderFormValues } from "@/lib/schema/checkout";

import { OtpDialog } from "@/components/layout/checkout/otp-dialog";
import BankDialog from "@/components/layout/checkout/bank-dialog";

// 🟢 New Hooks (logic đã tách ra)
import { useCheckoutInit } from "@/hooks/checkout/useCheckoutInit";
import { useCheckoutSubmit } from "@/hooks/checkout/useCheckoutSubmit";
import { useCartLocal } from "@/hooks/cart";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
// import CheckOutUserInformation from "@/components/layout/checkout/user-information";
// import CheckOutShippingAddress from "@/components/layout/checkout/shipping-address";
// import CheckOutInvoiceAddress from "@/components/layout/checkout/invoice-address";
import CheckoutSummary from "./checkout-summary";
import CheckoutProducts from "./check-out-products";
import CartTable from "../cart/cart-table";
import CartLocalTable from "../cart/cart-local-table";
import StripeLayout from "@/components/shared/stripe/stripe";

// const StripeLayout = dynamic(
//   () => import("@/components/shared/stripe/stripe"),
//   { ssr: false },
// );

const CheckOutUserInformation = dynamic(
  () => import("@/components/layout/checkout/user-information"),
  { ssr: false },
);

const CheckOutShippingAddress = dynamic(
  () => import("@/components/layout/checkout/shipping-address"),
  { ssr: false },
);

const CheckOutInvoiceAddress = dynamic(
  () => import("@/components/layout/checkout/invoice-address"),
  { ssr: false },
);

export default function CheckOutFormSection() {
  const t = useTranslations();
  const locale = useLocale();
  const { open } = useSidebar();
  const form = useFormContext<CreateOrderFormValues>();

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

  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});

  const { updateStatus } = useCartLocal();

  return (
    <form
      onSubmit={form.handleSubmit(
        (values) => handleSubmit(values),
        () => toast.error(t("checkFormError")),
      )}
      className="flex flex-col gap-8 section-padding"
    >
      <h2 className="section-header">{t("order")}</h2>

      {/* Main container */}
      <div
        className={cn(
          `grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-12 md:px-14 px-4`,
          open ? "lg:px-32" : "lg:px-52",
        )}
      >
        {/* Left side */}
        <div className="col-span-1 space-y-4 lg:space-y-12">
          <CheckOutUserInformation isLogin={!!userIdLogin} />
          <CheckOutShippingAddress key={`shipping-${userId}`} />
          <CheckOutInvoiceAddress key={`invoice-${userId}`} />
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
            <StripeLayout
              clientSecret={clientSecret}
              setClientSecret={setClientSecret}
              total={total}
              setTotal={setTotal}
              openDialog={openCardDialog}
              setOpenDialog={setOpenCardDialog}
              form={form}
              userEmail={form.watch("email")}
              additionalAddress={form.watch("shipping_address_additional")}
              address={form.watch("shipping_address_line")}
              city={form.watch("shipping_city")}
              postalCode={form.watch("shipping_postal_code")}
            />
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
