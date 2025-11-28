"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUploadStaticFile } from "@/features/file/hook";
import { useSendMail } from "@/features/mail/hook";
import { useGetUserById } from "@/features/users/hook";
import { useAtom } from "jotai";
import { checkOutIdAtom, paymentIdAtom } from "@/store/payment";
import {
  getCheckOutByCheckOutId,
  getMainCheckOutByMainCheckOutId,
} from "@/features/checkout/api";
import { getInvoiceByCheckOut } from "@/features/invoice/api";
import { useQuery } from "@tanstack/react-query";
import { InvoicePDF } from "@/components/layout/pdf/file";
import { pdf } from "@react-pdf/renderer";
import Image from "next/image";
import { useCapturePayment } from "@/features/payment/hook";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { Button } from "@/components/ui/button";

const OrderPlaced = () => {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const paymentIntentId = params?.get("payment_intent"); // Lấy param paymentIntent.id nếu có
  const hasFetchedRef = React.useRef(false);
  const hasProcessedRef = React.useRef(false);

  const [counter, setCounter] = useState(5);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkoutId, setCheckOutId] = useAtom(checkOutIdAtom);
  const [paymentId, setPaymentId] = useAtom(paymentIdAtom);

  const capturePaymentMutation = useCapturePayment();
  const uploadStaticFileMutation = useUploadStaticFile();
  const sendMailMutation = useSendMail();
  const t = useTranslations();

  // Lấy userId từ localStorage
  useEffect(() => {
    const id =
      localStorage.getItem("userIdGuest") || localStorage.getItem("userId");
    if (id) setUserId(id);
  }, []);

  const { data: checkout, isLoading: isCheckoutLoading } = useQuery({
    queryKey: ["checkout-id", checkoutId],
    enabled: Boolean(checkoutId) && !hasFetchedRef.current,
    retry: false,
    queryFn: async () => {
      hasFetchedRef.current = true; // 🔥 khóa luôn, queryFn sẽ không bao giờ chạy lại

      // Capture payment nếu cần
      if (!paymentIntentId && paymentId) {
        await capturePaymentMutation.mutateAsync(paymentId);
      }

      return getMainCheckOutByMainCheckOutId(checkoutId!);
    },
  });

  const { data: invoice } = useQuery({
    queryKey: ["invoice-checkout", checkoutId],
    queryFn: () => getInvoiceByCheckOut(checkoutId as string),
    enabled: !!checkout, // chỉ fetch khi checkout đã có dữ liệu
  });

  // Gọi hook trực tiếp
  const { data: user } = useGetUserById(userId || "");

  // Luồng xử lý khi có user
  useEffect(() => {
    if (!checkout || !invoice || !user) return;
    if (hasProcessedRef.current) return; // 🔥 tránh chạy lại useEffect

    hasProcessedRef.current = true;

    const process = async () => {
      try {
        const doc = (
          <InvoicePDF
            checkout={checkout}
            invoice={invoice}
          />
        );
        const asPdf = pdf(doc);
        const blob = await asPdf.toBlob();

        // 2. upload file
        const file = new File([blob], "invoice.pdf", {
          type: "application/pdf",
        });
        const formData = new FormData();
        formData.append("files", file);
        const uploadRes = await uploadStaticFileMutation.mutateAsync(formData);

        // 3. Send mail
        await sendMailMutation.mutateAsync({
          to_email: user.email,
          attachment_url: uploadRes.results[0].url,
          checkout_id: checkout.checkout_code,
          first_name: user.first_name ?? "",
          german: locale === "de",
        });

        // ✅ Sau khi gửi mail thành công → clear paymentId & checkoutId
        localStorage.removeItem("paymentId");
        localStorage.removeItem("checkoutId");
        setPaymentId(null);
        setCheckOutId(null);
      } catch (err) {
        console.error(err);
      }
    };
    process();
  }, [checkout, invoice, user]);

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center gap-12 -translate-y-10">
      <div className="px-5 py-6 flex flex-col items-center gap-3">
        <Image
          src="/new-logo.svg"
          alt="Prestige Home logo"
          width={100}
          height={100}
          priority
          className="w-auto h-[80px]"
        />
        <div className="text-2xl flex gap-1">
          <span className="text-secondary text-[40px] font-semibold">
            Prestige
          </span>
          <span className="text-primary text-[40px] font-semibold">Home</span>
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center bg-white text-center w-fit h-fit px-40 py-8">
        <div className="absolute top-0 left-0 w-40 h-32 bg-secondary clip-triangle-top-left" />
        <div className="absolute bottom-0 right-0 w-40 h-32 bg-primary clip-triangle-bottom-right" />

        <h1 className="text-6xl text-gray-700 mb-6 italic">{t("thankYou")}</h1>

        <p className="text-gray-600 text-lg">{t("orderPlacedMessage")}</p>
        <p className="text-gray-600 text-lg mt-2">{t("trackingInfoMessage")}</p>
        <p className="text-gray-600 text-lg mt-2">{t("thankYouShopping")}</p>

        {/* <p className="text-primary text-base mt-6">
                    {t('redirectHome')} <span className="font-semibold text-secondary">{counter}</span> {t('seconds')}.
                </p> */}
        <Button
          variant={"secondary"}
          onClick={() => router.push("/", { locale })}
          className="mt-6"
        >
          {t("continueShopping")}
        </Button>
      </div>
    </div>
  );
};

export default OrderPlaced;
