"use client";

import React, { useEffect, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import {
  PaymentRequest,
  PaymentRequestPaymentMethodEvent,
} from "@stripe/stripe-js";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import { UseFormReturn } from "react-hook-form";
import { CreateOrderFormValues } from "@/lib/schema/checkout";
import CheckoutPaymentUI from "./payment-ui";

export type CheckoutFormProps = {
  clientSecret: string | null;
  setClientSecret: (v: string | null) => void;
  total?: number;
  setTotal?: (v: number) => void;
  openDialog?: boolean;
  setOpenDialog?: (v: boolean) => void;
  userEmail?: string;
  city?: string;
  address?: string;
  additionalAddress?: string;
  postalCode?: string;
  form: UseFormReturn<CreateOrderFormValues>;
};

export default function CheckoutPaymentLogic(props: CheckoutFormProps) {
  const {
    clientSecret,
    setClientSecret,
    total,
    openDialog,
    setOpenDialog,
    userEmail,
    form,
  } = props;

  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const selectedMethod = form.watch("payment_method");
  const { control } = form;

  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null,
  );

  // ============================
  // 🔹 Redirect success
  // ============================
  const handlePaymentSuccess = (paymentIntentId: string) => {
    router.push(
      `https://prestige-home.de/de/thank-you?payment_intent=${paymentIntentId}`,
      { locale },
    );
  };

  // ============================
  // 🔹 Cleanup / Reset lỗi
  // ============================
  const handlePaymentFail = (msg?: string) => {
    toast.error(msg || t("paymentFailed"));
    form.reset();
  };

  // ============================
  // 🔹 Thay đổi phương thức thanh toán → reset clientSecret
  // ============================
  useEffect(() => {
    setClientSecret(null);
    setPaymentRequest(null);
  }, [selectedMethod]);

  // ============================
  // 🔹 Apple Pay / Google Pay / Klarna logic
  // ============================
  useEffect(() => {
    if (!stripe || !clientSecret) return;

    let pr: PaymentRequest | null = null;

    // ---------------- Apple Pay + Google Pay ----------------
    if (selectedMethod === "applepay" || selectedMethod === "googlepay") {
      pr = stripe.paymentRequest({
        country: "DE",
        currency: "eur",
        total: { label: "Prestige Home", amount: total ?? 0 },
        requestPayerEmail: true,
        requestPayerName: true,
      });

      pr.on("paymentmethod", async (ev: PaymentRequestPaymentMethodEvent) => {
        try {
          const { error, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false },
          );

          if (error) {
            ev.complete("fail");
            handlePaymentFail(error.message);
            return;
          }

          ev.complete("success");

          if (paymentIntent?.status === "requires_action") {
            await stripe.confirmCardPayment(clientSecret);
          }

          if (paymentIntent?.status === "succeeded") {
            handlePaymentSuccess(paymentIntent.id);
          }
        } catch (e) {
          ev.complete("fail");
          handlePaymentFail("Payment failed");
        }
      });

      pr.canMakePayment().then((res) => {
        if (res) {
          setPaymentRequest(pr!);
          pr!.show();
        } else {
          handlePaymentFail(t("browserNotSupport"));
        }
      });
    }

    // ---------------- Klarna ----------------
    if (selectedMethod === "klarna") {
      stripe
        .confirmKlarnaPayment(clientSecret, {
          payment_method: {
            billing_details: {
              email: userEmail || "example@gmail.com",
              address: { country: "DE" },
            },
          },
          return_url: `https://prestige-home.de/de/thank-you`,
        })
        .then(({ error }) => {
          if (error) handlePaymentFail(error.message);
        })
        .catch(() => handlePaymentFail());
    }

    return () => {
      pr?.abort?.();
    };
  }, [selectedMethod, stripe, clientSecret]);

  // ============================
  // 🔹 Stripe NOT ready → show loader
  // ============================
  if (!stripe || !elements) return <Loader2 className="animate-spin" />;

  // ============================
  // 🔹 Card payment click
  // ============================
  const handleCardPay = async () => {
    if (!stripe || !elements || !clientSecret) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card } },
      );

      if (error) {
        handlePaymentFail(error.message);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        handlePaymentSuccess(paymentIntent.id);
      }
    } catch {
      handlePaymentFail();
    }
  };

  return (
    <>
      <CheckoutPaymentUI
        control={control}
        selectedMethod={selectedMethod}
        onChange={(v) => form.setValue("payment_method", v)}
        t={t}
      />

      {/* CARD DIALOG */}
      {selectedMethod === "card" && clientSecret && (
        <Dialog
          open={openDialog}
          onOpenChange={setOpenDialog}
        >
          <DialogContent className="lg:max-w-[600px]! max-w-11/12">
            <DialogHeader>
              <DialogTitle>{t("enterCardDetails")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="border rounded-md p-2">
                <CardElement options={{ hidePostalCode: true }} />
              </div>

              <Button
                className="w-full"
                onClick={handleCardPay}
              >
                {t("payWithCard")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
