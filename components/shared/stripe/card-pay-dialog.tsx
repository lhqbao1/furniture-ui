"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Dispatch, SetStateAction } from "react";

export interface CardDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>> | ((v: boolean) => void);
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onFail: (errorMessage?: string) => void;
}

export default function CardDialog({
  open,
  onOpenChange,
  clientSecret,
  onSuccess,
  onFail,
}: CardDialogProps) {
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations();

  const handlePay = async () => {
    if (!stripe || !elements) {
      toast.error(t("stripeWating"));
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      toast.error(t("changePayment"));
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card } },
      );

      if (error) {
        onFail(error.message);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        onSuccess(paymentIntent.id);
      } else {
        onFail("Payment was not completed.");
      }
    } catch {
      onFail("Payment failed. Please try again.");
    }
  };

  const loading = !stripe || !elements;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="lg:max-w-[600px] max-w-11/12 space-y-6">
        <DialogHeader>
          <DialogTitle>{t("enterCardDetails")}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            <div className="border rounded-md p-3">
              <CardElement options={{ hidePostalCode: true }} />
            </div>

            <Button
              className="w-full py-4"
              type="button"
              onClick={handlePay}
            >
              {t("payWithCard")}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
