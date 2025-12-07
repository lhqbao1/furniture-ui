"use client";

import { useEffect, useRef, useState } from "react";
import {
  PaymentRequestButtonElement,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import type { PaymentRequest } from "@stripe/stripe-js";

export interface CheckoutPaymentLogicProps {
  clientSecret: string;
  selectedMethod: string;
  total: number; // cents
  currency?: string;
  userEmail?: string;
  onSuccess: (paymentIntentId: string) => void;
  onFail: (message?: string) => void;
}

export default function CheckoutPaymentLogic({
  clientSecret,
  selectedMethod,
  total,
  currency = "eur",
  userEmail,
  onSuccess,
  onFail,
}: CheckoutPaymentLogicProps) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null,
  );
  const t = useTranslations();
  const paymentRequestRef = useRef<PaymentRequest | null>(null);

  useEffect(() => {
    console.log("=== EFFECT START ===");
    console.log("Stripe ready:", !!stripe);
    console.log("Selected method:", selectedMethod);
    console.log("Client secret:", clientSecret);
    console.log("Total amount:", total);
    console.log("Currency:", currency);

    if (!stripe) {
      console.log("⛔ Stripe not ready");
      return;
    }

    // --- CLEANUP BEFORE RECREATING ---
    if (paymentRequestRef.current) {
      console.log("🧹 Cleaning previous PaymentRequest…");

      try {
        paymentRequestRef.current.off("paymentmethod");
        paymentRequestRef.current.abort?.();
        (paymentRequestRef.current as any)._events = {};
        paymentRequestRef.current = null;
      } catch (err) {
        console.warn("Cleanup error:", err);
      }
    }

    // Disable Apple Pay / Google Pay if not selected
    if (selectedMethod !== "applepay" && selectedMethod !== "googlepay") {
      console.log("❌ Not an express method, clearing PR");
      paymentRequestRef.current = null;
      return;
    }

    // --- CREATE PAYMENT REQUEST ---
    console.log("🆕 Creating PaymentRequest…");

    const pr = stripe.paymentRequest({
      country: "DE",
      currency,
      total: { label: "Prestige Home", amount: total },
      requestPayerEmail: true,
      requestPayerName: true,
    });

    console.log("PaymentRequest object:", pr);

    paymentRequestRef.current = pr;

    // Bind handler BEFORE canMakePayment()
    const handler = async (ev: any) => {
      console.log("⚡ paymentmethod event fired", ev);

      try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        );

        if (error) {
          console.log("❌ confirmCardPayment error:", error);
          ev.complete("fail");
          return onFail(error.message);
        }

        console.log("PaymentIntent:", paymentIntent);

        ev.complete("success");

        if (paymentIntent?.status === "requires_action") {
          const result = await stripe.confirmCardPayment(clientSecret);

          console.log("requires_action -> result:", result);

          if (result.error) return onFail(result.error.message);
          if (result.paymentIntent?.status === "succeeded")
            onSuccess(result.paymentIntent.id);
        } else if (paymentIntent?.status === "succeeded") {
          console.log("Payment succeeded!");
          onSuccess(paymentIntent.id);
        }
      } catch (e) {
        console.log("❌ Exception in handler:", e);
        ev.complete("fail");
        onFail("Payment failed");
      }
    };

    console.log("📌 Binding paymentmethod listener");
    pr.on("paymentmethod", handler);

    // CAN MAKE PAYMENT CHECK
    console.log("🔍 Checking canMakePayment()…");

    pr.canMakePayment().then((res) => {
      console.log("➡️ canMakePayment result:", res);

      if (res) {
        console.log("🎉 Express payment supported!");
        setPaymentRequest(pr);
      } else {
        console.log("⛔ Express payment NOT supported");
        setPaymentRequest(null);
      }
    });

    // Cleanup
    return () => {
      console.log("=== CLEANUP ===");

      if (paymentRequestRef.current) {
        try {
          paymentRequestRef.current.off("paymentmethod", handler);
          paymentRequestRef.current.abort?.();
          (paymentRequestRef.current as any)._events = {};
          console.log("🧹 PaymentRequest cleaned");
        } catch (err) {
          console.warn("Cleanup error:", err);
        }

        paymentRequestRef.current = null;
      }
    };
  }, [stripe, selectedMethod, clientSecret, total]);

  // FAIL WHEN METHOD SELECTED BUT NO PAYMENTREQUEST
  useEffect(() => {
    console.log("Express UI useEffect → PR:", paymentRequest);

    if (
      (selectedMethod === "applepay" || selectedMethod === "googlepay") &&
      stripe &&
      paymentRequest === null
    ) {
      console.log("❌ Express method selected but PR null → unsupported");
      onFail(t("browserNotSupport"));
    }
  }, [selectedMethod, stripe, paymentRequest]);

  if (selectedMethod === "applepay" || selectedMethod === "googlepay") {
    if (!paymentRequest) {
      console.log("🚫 Express button hidden because PR = null");
      return null;
    }

    console.log("✅ Rendering PaymentRequestButtonElement");
    return (
      <div className="py-4">
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: { paymentRequestButton: { type: "default" } },
          }}
        />
      </div>
    );
  }

  return null;
}
