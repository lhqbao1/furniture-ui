"use client";

import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

export interface CardDialogProps {
  /** Dialog có mở hay không */
  open: boolean;

  /** Callback thay đổi trạng thái dialog */
  onOpenChange?: Dispatch<SetStateAction<boolean>> | ((v: boolean) => void);

  /** Stripe clientSecret để xác nhận thanh toán */
  clientSecret: string;

  /** Callback khi thanh toán thành công */
  onSuccess: (paymentIntentId: string) => void;

  /** Callback khi thanh toán thất bại */
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
    if (!stripe || !elements || !clientSecret) {
      toast.error(t("stripeWating"));
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      toast.error(t("changePayment"));
      return;
    }

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
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="lg:max-w-[600px] max-w-11/12">
        <DialogHeader>
          <DialogTitle>{t("enterCardDetails")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-md p-2">
            <CardElement options={{ hidePostalCode: true }} />
          </div>

          <Button
            className="w-full"
            onClick={handlePay}
            type="button"
          >
            {t("payWithCard")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
