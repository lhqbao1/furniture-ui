"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUploadStaticFile } from "@/features/file/hook";
import { useSendMail } from "@/features/mail/hook";
import { useGetUserById } from "@/features/users/hook";
import { useAtom } from "jotai";
import { checkOutIdAtom, paymentIdAtom } from "@/store/payment";
import { getMainCheckOutByMainCheckOutId } from "@/features/checkout/api";
import { getInvoiceByCheckOut } from "@/features/invoice/api";
import { useQuery } from "@tanstack/react-query";
import { InvoicePDF } from "@/components/layout/pdf/file";
import { pdf } from "@react-pdf/renderer";
import Image from "next/image";
import { useCapturePayment } from "@/features/payment/hook";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { Button } from "@/components/ui/button";
import { userIdAtom } from "@/store/auth";
import { useUseVoucher } from "@/features/vouchers/hook";
import { currentVoucherAtom } from "@/store/voucher";
import { Loader2 } from "lucide-react";
import { TrustedShopsCheckout } from "@/components/layout/thank-you/trusted-card";
import {
  formatDateToTrustedShops,
  getOrderLatestDeliveryDate,
} from "@/hooks/get-latest-delivery-date";

const OrderPlaced = () => {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const paymentIntentId = params?.get("payment_intent"); // Lấy param paymentIntent.id nếu có
  const hasFetchedRef = React.useRef(false);
  const hasProcessedRef = React.useRef(false);
  const [delayed, setDelayed] = React.useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(true);

  const [userId, setUserId] = useAtom(userIdAtom);
  const [checkoutId, setCheckOutId] = useAtom(checkOutIdAtom);
  const [paymentId, setPaymentId] = useAtom(paymentIdAtom);
  const [voucherId, setVoucherId] = useAtom(currentVoucherAtom);

  const capturePaymentMutation = useCapturePayment();
  const uploadStaticFileMutation = useUploadStaticFile();
  const sendMailMutation = useSendMail();
  const useVoucherMutation = useUseVoucher();

  const t = useTranslations();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayed(true); // 🔥 sau 3 giây mới cho phép chạy query
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isProcessingPayment) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isProcessingPayment]);

  const retryCaptureUntilSuccess = async (paymentId: string) => {
    const maxRetries = 5;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await capturePaymentMutation.mutateAsync(paymentId);

        // Nếu API trả success → break
        if (res?.status === "completed") {
          return res;
        }

        console.log(`Attempt ${attempt}: status = ${res?.status}`);
      } catch (err) {
        console.log(`Attempt ${attempt} failed:`, err);
      }

      // Nếu chưa đến lần retry cuối → chờ 3s rồi retry
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // ❗ Sau 5 lần vẫn lỗi
    throw new Error("Capture payment failed after 5 retries");
  };

  const { data: checkout } = useQuery({
    queryKey: ["checkout-id", checkoutId],
    enabled: delayed && Boolean(checkoutId) && !hasFetchedRef.current,
    retry: false, // Ta tự retry rồi nên không cần retry của React Query
    queryFn: async () => {
      hasFetchedRef.current = true;

      if (!paymentIntentId && paymentId) {
        await retryCaptureUntilSuccess(paymentId);
      }

      // ✅ Capture OK → ẩn loader
      setIsProcessingPayment(false);
      console.log("done");

      return getMainCheckOutByMainCheckOutId(checkoutId!);
    },
  });

  useEffect(() => {
    if (checkout) {
      setIsProcessingPayment(false);
    }
  }, [checkout]);

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

  const estimatedDeliveryDate = formatDateToTrustedShops(
    getOrderLatestDeliveryDate(
      checkout?.checkouts.flatMap((c) =>
        c.cart.items.map((item) => ({
          stock: item.products.stock,
          inventory: item.products.inventory,
          deliveryTime: item.products.delivery_time,
        })),
      ) ?? [],
    ),
  );

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

        {isProcessingPayment && (
          <div className="mt-6 flex flex-col items-center gap-3 text-gray-600">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm italic">{t("orderProcessingMessage")}</p>
          </div>
        )}

        {/* <p className="text-primary text-base mt-6">
                    {t('redirectHome')} <span className="font-semibold text-secondary">{counter}</span> {t('seconds')}.
                </p> */}
        <Button
          variant="secondary"
          disabled={isProcessingPayment}
          onClick={() => router.push("/", { locale })}
          className="mt-6"
        >
          {t("continueShopping")}
        </Button>
      </div>

      {checkout && (
        <TrustedShopsCheckout
          amount={checkout?.total_amount}
          buyerEmail={checkout.checkouts[0].user.email}
          currency="EUR"
          estimatedDeliveryDate={estimatedDeliveryDate ?? ""}
          orderNumber={checkout.checkout_code}
          paymentType={checkout.payment_method}
          products={checkout.checkouts
            .flatMap((c) => c.cart.items)
            .flatMap((c) => c.products)}
        />
      )}
    </div>
  );
};

export default OrderPlaced;
