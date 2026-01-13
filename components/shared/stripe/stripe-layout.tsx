"use client";

import { useEffect } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import CheckoutPaymentUI from "./payment-ui";
import CheckoutPaymentLogic from "./payment-logic";
import CardDialog from "./card-pay-dialog";
import StripeProvider from "./stripe";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import { CreateOrderFormValues } from "@/lib/schema/checkout";

interface StripeLayoutProps {
  form: UseFormReturn<CreateOrderFormValues>; // react-hook-form instance
  clientSecret: string | null; // PaymentIntent client_secret
  setClientSecret: (clientSecret: string | null) => void;
  openDialog: boolean; // mở dialog cho card
  setOpenDialog: (v: boolean) => void; // đổi trạng thái dialog

  total: number; // tổng tiền (cents)
}

export default function StripeLayout({
  form,
  clientSecret,
  setClientSecret,
  openDialog,
  setOpenDialog,
  total,
}: StripeLayoutProps) {
  const t = useTranslations();
  const stripe = useStripe(); // Stripe instance inside Provider
  const selectedMethod = form.watch("payment_method");
  const router = useRouter();
  const locale = useLocale();

  // ⭐ AUTO-PAY KLARNA NGAY SAU SUBMIT
  useEffect(() => {
    const autoKlarna = async () => {
      if (!stripe) return;
      if (!clientSecret) return;
      if (selectedMethod !== "klarna") return;

      const { error } = await stripe.confirmKlarnaPayment(clientSecret, {
        payment_method: {
          billing_details: {
            email: form.watch("email"),
            address: { country: "DE" },
          },
        },
        return_url: `https://prestige-home.de/${locale}/thank-you`,
      });

      if (error) toast.error(error.message);
    };

    autoKlarna();
  }, [stripe, clientSecret, selectedMethod]);

  const handleCardSuccess = (piId: string) => {
    router.push(
      `https://prestige-home.de/${locale}/thank-you?payment_intent=${piId}`,
    );
  };

  const handleFail = (msg?: string) => {
    toast.error(msg || t("paymentFailed"));
    setClientSecret(null);
  };

  return (
    <>
      {/* <CheckoutPaymentUI
        control={form.control}
        selectedMethod={selectedMethod}
        onChange={(v) => form.setValue("payment_method", v)}
        t={t}
      /> */}

      {clientSecret && (
        <>
          {/* CARD → mở dialog nhập thẻ */}
          {selectedMethod === "card" && (
            <CardDialog
              open={openDialog}
              onOpenChange={setOpenDialog}
              clientSecret={clientSecret}
              onSuccess={handleCardSuccess}
              onFail={handleFail}
            />
          )}

          {/* APPLE + GOOGLE PAY → mount ngay PaymentRequestButton */}
          {(selectedMethod === "applepay" ||
            selectedMethod === "googlepay") && (
            <CheckoutPaymentLogic
              clientSecret={clientSecret}
              selectedMethod={selectedMethod}
              total={total}
              currency="eur"
              userEmail={form.watch("email")}
              onSuccess={(piId) => handleCardSuccess(piId)}
              onFail={handleFail}
            />
          )}
        </>
      )}
    </>
  );
}
