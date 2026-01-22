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
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import {
  useSendTawkMessage,
  useUploadContactForm,
} from "@/features/contact/hook";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { hasRequestedVoucherAtom, voucherDialogAtom } from "@/store/voucher";

interface RequestOfferDialogProps {
  productName?: string;
  productUrl?: string;
}

export default function RequestOfferDialog({
  productName,
  productUrl,
}: RequestOfferDialogProps) {
  const t = useTranslations();

  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [hasRequestedVoucher, setHasRequestedVoucher] = useAtom(
    hasRequestedVoucherAtom,
  );
  const [dialogStep, setDialogStep] = useAtom(voucherDialogAtom);

  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const sendContactMutation = useUploadContactForm();

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
    if (open) {
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
  }, [open, defaultMessage]);

  const handleSubmit = () => {
    // 🔴 validate
    if (!email) {
      setEmailError(t("emailRequired", { default: "Email is required" }));
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(t("invalidEmail", { default: "Invalid email address" }));
      return;
    }

    setEmailError(null);

    if (!message) return;

    sendContactMutation.mutate(
      {
        email,
        message,
        subject: "Request Voucher",
        type: "voucher",
      },
      {
        onSuccess() {
          toast.success(t("messageSent"));
          setDialogStep("apply");
          setHasRequestedVoucher(true);
        },
        onError() {
          toast.error(
            t("messageSendFail", { default: "Failed to send request" }),
          );
        },
      },
    );
  };

  return (
    <Dialog
      open={dialogStep === "request"}
      onOpenChange={(open) => {
        if (!open) setDialogStep("none");
      }}
    >
      <DialogTrigger asChild>
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
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
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

        <div className="space-y-4 mt-4">
          {/* EMAIL */}
          <div className="space-y-1">
            <Input
              ref={emailInputRef}
              type="email"
              placeholder={t("email")}
              value={email}
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
            disabled={!!emailError || !email || sendContactMutation.isPending}
          >
            {t("send")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
