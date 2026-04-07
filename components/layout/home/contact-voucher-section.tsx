"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useUploadContactForm } from "@/features/contact/hook";
import { BadgePercent } from "lucide-react";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function NewsletterVoucherSection() {
  const t = useTranslations("newsletter_voucher");
  const tAll = useTranslations();
  const sendContactMutation = useUploadContactForm();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ validate email
    if (!EMAIL_REGEX.test(email)) {
      toast.error(t("invalidEmail"));
      return;
    }

    sendContactMutation.mutate(
      {
        email,
        message: "Welcome Voucher",
        subject: "Request Voucher",
        type: "voucher5",
      },
      {
        onSuccess() {
          toast.success(tAll("messageSent", { default: "Request sent" }));
          setEmail("");
        },
        onError() {
          toast.error(
            tAll("messageSendFail", { default: "Failed to send request" }),
          );
        },
      },
    );
  };

  return (
    <section className="w-full py-4 md:py-8 xl:py-12 bg-gradient-to-r from-[#f4fbf7] via-white to-[#fff6ec]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="rounded-2xl border border-emerald-100/70 bg-white/85 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm px-5 py-6 sm:px-7 sm:py-7 xl:px-10 xl:py-9">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-10 items-center">
            <div className="lg:col-span-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <BadgePercent className="size-3.5" />
                Newsletter Deal
              </div>
              <h3 className="mt-3 text-xl xl:text-2xl font-semibold text-slate-900 tracking-tight">
                {t("title")}
              </h3>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-slate-600">
                {t("description")}
              </p>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Input
                    type="text"
                    placeholder={t("emailPlaceholder")}
                    className="h-12 rounded-lg border-slate-200 bg-white text-base focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={sendContactMutation.isPending}
                    required
                  />
                  <Button
                    type="submit"
                    className="h-12 rounded-lg bg-secondary hover:bg-secondary/90 text-white px-6 sm:px-8 shrink-0 transition-all duration-200"
                    disabled={sendContactMutation.isPending}
                  >
                    {sendContactMutation.isPending ? t("sending") : t("cta")}
                  </Button>
                </div>
              </form>

              <p className="mt-3 text-xs md:text-sm leading-relaxed text-slate-500">
                {t("legal")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
