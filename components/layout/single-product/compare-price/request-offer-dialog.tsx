"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocale, useTranslations } from "next-intl";
import { useUploadContactForm } from "@/features/contact/hook";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { hasRequestedVoucherAtom, voucherDialogAtom } from "@/store/voucher";
import { ProductItem } from "@/types/products";
import { useAddToCart } from "@/features/cart/hook";
import { userIdAtom } from "@/store/auth";
import { useAddToCartLocalEnhanced } from "@/hooks/cart/add-to-cart-enhanched";
import { HandleApiError } from "@/lib/api-helper";
import { useRouter } from "@/src/i18n/navigation";

interface RequestOfferDialogProps {
  productName?: string;
  productId?: string;
  product?: ProductItem;
}

export default function RequestOfferDialog({
  productName,
  productId,
  product,
}: RequestOfferDialogProps) {
  const TOAST_DURATION = 6000;
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [hasRequestedVoucher, setHasRequestedVoucher] = useAtom(
    hasRequestedVoucherAtom,
  );
  const [dialogStep, setDialogStep] = useAtom(voucherDialogAtom);
  const [userId] = useAtom(userIdAtom);

  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const formContainerRef = React.useRef<HTMLDivElement>(null);
  const sendContactMutation = useUploadContactForm();
  const addToCartMutation = useAddToCart();
  const { addToCartLocalOnly } = useAddToCartLocalEnhanced();
  const isDialogOpen = dialogStep === "request";

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 🔹 Prefill message (CASE 1)
  const defaultMessage = React.useMemo(
    () =>
      t("defaultOfferMessage", {
        product: productName ?? "",
      }),
    [t, productName],
  );

  const [message, setMessage] = React.useState(defaultMessage);

  /* -----------------------------
   * Auto-focus + Reset form
   * ----------------------------- */
  React.useEffect(() => {
    if (isDialogOpen) {
      // Auto-focus email khi mở dialog
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);
    } else {
      // Reset form khi đóng dialog
      setEmail("");
      setMessage(defaultMessage);
      setEmailError(null);
    }
  }, [isDialogOpen, defaultMessage]);

  const addProductAndGoCheckout = React.useCallback(() => {
    if (!productId) {
      router.push("/check-out", { locale });
      return;
    }

    // Guest checkout flow -> local cart
    if (!userId) {
      if (!product) {
        toast.error(t("addToCartFail"), { duration: TOAST_DURATION });
        return;
      }

      addToCartLocalOnly(product, 1, {
        onSuccess: () => {
          router.push("/check-out", { locale });
        },
      });
      return;
    }

    // Logged-in flow -> server cart
    addToCartMutation.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          toast.success(t("addToCartSuccess"), { duration: TOAST_DURATION });
          router.push("/check-out", { locale });
        },
        onError: (error) => {
          const { status } = HandleApiError(error, t);
          toast.error(t("addToCartFail"), { duration: TOAST_DURATION });
          if (status === 401) {
            router.push("/login", { locale });
          }
        },
      },
    );
  }, [
    addToCartLocalOnly,
    addToCartMutation,
    locale,
    product,
    productId,
    router,
    t,
    userId,
  ]);

  const handleSubmit = async () => {
    // 🔴 validate
    if (!email) {
      setEmailError(t("emailRequired"));
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(t("invalidEmail"));
      return;
    }

    setEmailError(null);

    if (!message) return;

    const loadingToastId = toast.loading(t("requestOfferSending"));

    try {
      await sendContactMutation.mutateAsync({
        email,
        message,
        subject: "Request Voucher",
        type: "voucher",
        product_id: productId,
      });

      toast.dismiss(loadingToastId);
      toast.success(t("messageSent"), { duration: TOAST_DURATION });
      setDialogStep("none");
      setHasRequestedVoucher(true);
      addProductAndGoCheckout();
    } catch {
      toast.dismiss(loadingToastId);
      toast.error(t("messageSendFail"), { duration: TOAST_DURATION });
    }
  };

  const handleEmailFocus = React.useCallback(() => {
    setTimeout(() => {
      emailInputRef.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
      formContainerRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 220);
  }, []);

  return (
    <Dialog
      open={dialogStep === "request"}
      onOpenChange={(open) => {
        if (!open) setDialogStep("none");
      }}
    >
      <DialogTrigger asChild>
        <Button
          onClick={() => setDialogStep("request")}
          className={`rounded-md lg:px-4 mr-1 text-sm ${
            hasRequestedVoucher ? "bg-gray-500 text-white" : ""
          }`}
        >
          {t("requestOffer")}
        </Button>
      </DialogTrigger>

      <DialogContent className="top-[max(0.75rem,env(safe-area-inset-top))] max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-md translate-y-0 overflow-y-auto p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:top-[50%] sm:translate-y-[-50%] sm:p-6">
        <DialogHeader>
          <DialogTitle>{t("contactTitle")}</DialogTitle>
          <DialogDescription>
            <div>
              Wir sind stets bemüht, Ihnen die bestmögliche Qualität zum
              bestmöglichen Preis anzubieten.
            </div>
            <div>
              {" "}
              Gerne senden wir Ihnen einen exklusiven Gutschein zu. 10 % Rabatt,
              maximal 50 EUR.
            </div>
            <div>Bitte geben Sie Ihre E-Mail-Adresse ein.</div>
          </DialogDescription>
        </DialogHeader>

        <div ref={formContainerRef} className="mt-4 space-y-4">
          {/* EMAIL */}
          <div className="space-y-1">
            <Input
              ref={emailInputRef}
              type="email"
              placeholder={t("email")}
              value={email}
              onFocus={handleEmailFocus}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
            />
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </div>

          {/* MESSAGE */}
          {/* <Textarea
            rows={5}
            placeholder={t("message")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          /> */}

          {/* SUBMIT */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            // variant={"secondary"}
            disabled={
              !!emailError ||
              !email ||
              sendContactMutation.isPending ||
              addToCartMutation.isPending
            }
          >
            {t("send")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
