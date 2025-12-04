import { PaymentRequest } from "@stripe/stripe-js";
// payment-request.ts
import type { Stripe } from "@stripe/stripe-js";

export function createPaymentRequest({
  stripe,
  currency,
  total,
  clientSecret,
  onSuccess,
  onFail,
  setPaymentRequest,
  paymentRequestRef,
}: {
  stripe: Stripe | null;
  currency: string;
  total: number;
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onFail: (msg: string) => void;
  setPaymentRequest: (pr: PaymentRequest | null) => void;
  paymentRequestRef: React.MutableRefObject<PaymentRequest | null>;
}) {
  if (!stripe) return null;

  // Nếu đã có paymentRequest thì không tạo mới
  if (paymentRequestRef.current) return paymentRequestRef.current;

  const pr = stripe.paymentRequest({
    country: "DE",
    currency,
    total: { label: "Prestige Home", amount: total },
    requestPayerEmail: true,
    requestPayerName: true,
  });

  pr.canMakePayment().then((res) => {
    if (res) setPaymentRequest(pr);
    else setPaymentRequest(null);
  });

  // event handler duy nhất
  pr.on("paymentmethod", async (ev) => {
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false },
      );

      if (error) {
        ev.complete("fail");
        return onFail(error.message ?? "");
      }

      ev.complete("success");

      if (paymentIntent?.status === "requires_action") {
        const next = await stripe.confirmCardPayment(clientSecret);
        if (next.error) return onFail(next.error.message ?? "");
        if (next.paymentIntent?.status === "succeeded")
          return onSuccess(next.paymentIntent.id);
      }

      if (paymentIntent?.status === "succeeded") {
        return onSuccess(paymentIntent.id);
      }
    } catch (e) {
      ev.complete("fail");
      onFail("Payment failed");
    }
  });

  paymentRequestRef.current = pr;
  return pr;
}
