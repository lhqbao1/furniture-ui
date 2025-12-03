"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CheckoutStripeHandlerProps {
  clientSecret: string;
  selectedMethod: string;
  open: boolean;
  onClose: () => void;
}

export default function CheckoutStripeHandler({
  clientSecret,
  selectedMethod,
  open,
  onClose,
}: CheckoutStripeHandlerProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async () => {
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `https://prestige-home.de/de/thank-you?payment_intent=${clientSecret}`,
      },
    });

    if (error) {
      console.error(error.message);
      alert(error.message);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="p-6 max-w-md">
        {!clientSecret ? (
          <p>Loading payment...</p>
        ) : (
          <>
            <PaymentElement
              options={{ paymentMethodOrder: [selectedMethod] }}
            />

            <button
              onClick={handlePay}
              className="w-full mt-4 bg-black text-white py-2 rounded"
            >
              Pay Now
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
