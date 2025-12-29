"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { voucherDialogAtom } from "@/store/voucher";
import { useAtom } from "jotai";
import VoucherApplyComapre from "./voucher-apply";

export function ApplyVoucherDialog() {
  const [dialogStep, setDialogStep] = useAtom(voucherDialogAtom);

  return (
    <Dialog
      open={dialogStep === "apply"}
      onOpenChange={(open) => {
        if (!open) setDialogStep("success");
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Gutscheincode eingeben</DialogTitle>
        <DialogDescription className="text-center">
          Herzlichen Glückwunsch! Ihr Gutschein wurde erfolgreich an Ihre
          E-Mail-Adresse gesendet. Bitte geben Sie den Gutscheincode hier ein,
          um Ihren Rabatt zu erhalten.
        </DialogDescription>

        <VoucherApplyComapre />
      </DialogContent>
    </Dialog>
  );
}
