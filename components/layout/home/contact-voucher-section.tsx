"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewsletterVoucherSection() {
  const t = useTranslations("newsletter_voucher");

  return (
    <section className="w-full md:py-6 xl:py-10 py-4 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center md:space-y-0 space-y-4">
        {/* LEFT – BADGE */}
        <div className="lg:col-span-2 flex justify-center lg:justify-start">
          <div className="text-2xl font-bold border px-4 py-2 bg-white">
            5% Gutschein*
          </div>
        </div>

        {/* CENTER – TEXT */}
        <div className="lg:col-span-5 text-center lg:text-left space-y-2">
          <h3 className="font-semibold text-lg">{t("title")}</h3>
          <p className="text-sm text-gray-700">{t("description")}</p>
        </div>

        {/* RIGHT – FORM */}
        <div className="lg:col-span-5">
          <form className="flex w-full max-w-xl mx-auto lg:ml-auto">
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              className="rounded-none border-r-0 bg-white focus:ring-0"
              required
            />
            <Button
              type="submit"
              className="rounded-none bg-orange-600 hover:bg-orange-700 text-white px-6"
            >
              {t("cta")}
            </Button>
          </form>

          {/* LEGAL */}
          <p className="text-xs text-gray-500 mt-2">
            {t("legal")}{" "}
            <button
              type="button"
              className="underline hover:text-gray-700"
            >
              {t("showMore")}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
