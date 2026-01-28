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
import { Loader2 } from "lucide-react";
import {
  TrustedShopsCheckout,
  TrustedShopsCheckoutProps,
} from "@/components/layout/thank-you/trusted-card";
import {
  formatDateToTrustedShops,
  getOrderLatestDeliveryDate,
} from "@/hooks/get-latest-delivery-date";
import { calculateOrderTaxWithDiscount } from "@/lib/caculate-vat";

function waitForAwinReady(timeout = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();

    const check = () => {
      if ((window as any).AWIN?.Tracking?.run) {
        resolve(true);
        return;
      }
      if (Date.now() - start > timeout) {
        resolve(false);
        return;
      }
      setTimeout(check, 100);
    };

    check();
  });
}

const OrderPlaced = () => {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const paymentIntentId = params?.get("payment_intent"); // Lấy param paymentIntent.id nếu có
  const paypalToken = params?.get("token");

  const hasFetchedRef = React.useRef(false);
  const hasProcessedRef = React.useRef(false);
  const [delayed, setDelayed] = React.useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(true);
  const trustbadgeInitRef = React.useRef(false);

  const [userId, setUserId] = useAtom(userIdAtom);
  const [checkoutId, setCheckOutId] = useAtom(checkOutIdAtom);
  const [paymentId, setPaymentId] = useAtom(paymentIdAtom);
  const [paramsChecked, setParamsChecked] = useState(false);
  const [captureFailed, setCaptureFailed] = useState(false);

  const [trustedShopData, setTrustedShopData] =
    useState<TrustedShopsCheckoutProps | null>(null);

  const capturePaymentMutation = useCapturePayment();
  const uploadStaticFileMutation = useUploadStaticFile();
  const sendMailMutation = useSendMail();

  const t = useTranslations();

  useEffect(() => {
    const timer = setTimeout(() => {
      setParamsChecked(true);
    }, 300); // ⏳ chờ 1s

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!paramsChecked) return;

    // ❌ Không có Stripe & không có PayPal
    if (!paymentIntentId && !paypalToken) {
      router.replace("/", { locale });
    }
  }, [paramsChecked, paymentIntentId, paypalToken, router, locale]);

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

  const { data: checkout, error } = useQuery({
    queryKey: ["checkout-id", checkoutId],
    enabled: delayed && Boolean(checkoutId) && !hasFetchedRef.current,
    retry: false, // Ta tự retry rồi nên không cần retry của React Query
    queryFn: async () => {
      hasFetchedRef.current = true;

      try {
        if (!paymentIntentId && paymentId && paypalToken) {
          await retryCaptureUntilSuccess(paymentId);
        }

        return await getMainCheckOutByMainCheckOutId(checkoutId!);
      } catch (err) {
        console.error(err);
        // 🔥 PAYPAL CAPTURE FAIL
        if (paypalToken) {
          setCaptureFailed(true);
        }
        throw err;
      } finally {
        setIsProcessingPayment(false); // 🔥 LUÔN TẮT
      }
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

  // ====================
  // AWIN Conversion Tracking
  // ====================
  useEffect(() => {
    if (!checkout) return;

    // 🔒 chống double fire
    if (sessionStorage.getItem("awin_sent")) return;

    // 🔥 chỉ track khi có awc
    const awcAwin = localStorage.getItem("awc_awin");
    if (!awcAwin) return;

    let cancelled = false;

    const track = async () => {
      const isReady = await waitForAwinReady();

      const calc = calculateOrderTaxWithDiscount(
        checkout.checkouts.flatMap((c) => c.cart.items),
        checkout.voucher_amount ?? 0,
      );

      const amount = Number(calc.totalNetWithoutShipping).toFixed(2);
      const orderRef = checkout.checkout_code;

      // 👉 CASE 1: MasterTag OK → JS Conversion
      if (isReady && !cancelled) {
        (window as any).AWIN.Tracking.Sale = {
          amount,
          orderRef,
          parts: `DEFAULT:${amount}`,
          currency: "EUR",
          channel: "aw",
          customerAcquisition: "NEW",
          test: "0",
        };

        (window as any).AWIN.Tracking.run();
        sessionStorage.setItem("awin_sent", "1");
        return;
      }

      // 👉 CASE 2: MasterTag FAIL → fallback pixel
      if (!cancelled) {
        const img = document.createElement("img");
        img.src =
          `https://www.awin1.com/sread.img?` +
          `tt=ns&tv=2&merchant=121738` +
          `&amount=${amount}` +
          `&cr=EUR` +
          `&ref=${encodeURIComponent(orderRef)}` +
          `&parts=DEFAULT:${amount}` +
          `&ch=aw`;

        img.width = 0;
        img.height = 0;
        img.style.display = "none";

        document.body.appendChild(img);
        sessionStorage.setItem("awin_sent", "1");
      }
    };

    track();

    return () => {
      cancelled = true;
    };
  }, [checkout]);

  //Billiger Tracking
  useEffect(() => {
    if (!checkout) return;

    // chống double fire khi refresh / rerender
    if (sessionStorage.getItem("solute_sent")) return;

    const ttl = 1000 * 60 * 60 * 24 * 30;
    const a = localStorage.getItem("soluteclid");
    if (!a) return;

    const [timestamp, originUrl] = a.split(" ", 2);
    if (parseInt(timestamp) + ttl <= Date.now()) {
      localStorage.removeItem("soluteclid");
      return;
    }

    const b = a.split(" ", 2);
    if (parseInt(b[0]) + ttl > Date.now()) {
      const url = new URL("https://cmodul.solutenetwork.com/conversion");
      const calc = calculateOrderTaxWithDiscount(
        checkout.checkouts?.flatMap((c) => c.cart?.items ?? []) ?? [],
        checkout?.voucher_amount ?? 0,
        checkout.checkouts?.[0]?.shipping_address?.country ?? "DE",
        checkout.checkouts?.[0]?.user?.tax_id,
      );
      // fallback = "0,00"
      const val = Number(calc?.totalNetWithoutShipping ?? 0);

      url.searchParams.set("val", val.toFixed(2).replace(".", ","));
      url.searchParams.set("oid", checkout.checkout_code);
      url.searchParams.set("factor", "1");
      url.searchParams.set("url", b[1]);

      fetch(url.toString()).finally(() => {
        sessionStorage.setItem("solute_sent", "1");
        localStorage.removeItem("soluteclid"); // cleanup sau conversion success
      });
    } else {
      localStorage.removeItem("soluteclid");
    }
  }, [checkout]);

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

  //Trusted shop init
  useEffect(() => {
    if (!checkout) return;
    if (trustedShopData) return; // ❗ chỉ set 1 lần

    setTrustedShopData({
      orderNumber: checkout.checkout_code,
      buyerEmail: checkout.checkouts[0].user.email,
      amount: checkout.total_amount,
      currency: "EUR",
      paymentType: checkout.payment_method,
      estimatedDeliveryDate: estimatedDeliveryDate ?? "",
      products: checkout.checkouts
        .flatMap((c) => c.cart.items)
        .map((i) => i.products),
    });
  }, [checkout, estimatedDeliveryDate, trustedShopData]);

  //Trusted shop reload
  useEffect(() => {
    if (!trustedShopData) return;
    if (trustbadgeInitRef.current) return;

    const tb = (window as any).trustbadge;
    if (!tb?.remove || !tb?.reInitialize) return;

    trustbadgeInitRef.current = true;

    const timer = setTimeout(() => {
      try {
        tb.remove();
        tb.reInitialize();
        console.log("Trusted Shops reinitialized");
      } catch (e) {
        console.error("Trusted Shops error", e);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [trustedShopData]);

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
      <div className="relative flex flex-col items-center justify-center bg-white text-center w-fit h-fit md:px-40 px-20 py-8">
        <div className="absolute top-0 left-0 w-40 h-32 bg-secondary clip-triangle-top-left" />
        <div className="absolute bottom-0 right-0 w-40 h-32 bg-primary clip-triangle-bottom-right" />

        {captureFailed && (
          <div className="mt-6 text-center text-red-600 max-w-md">
            <h2 className="text-2xl font-semibold mb-2">
              {t("paymentFailedTitle")}
            </h2>
            <p className="text-sm">{t("paymentFailedMessage")}</p>
          </div>
        )}

        {!isProcessingPayment &&
          !captureFailed &&
          (paymentIntentId || paypalToken) && (
            <>
              <h1 className="text-6xl text-gray-700 mb-6 italic">
                {t("thankYou")}
              </h1>

              <p className="text-gray-600 text-lg">{t("orderPlacedMessage")}</p>
              <p className="text-gray-600 text-lg mt-2">
                {t("trackingInfoMessage")}
              </p>
              <p className="text-gray-600 text-lg mt-2">
                {t("thankYouShopping")}
              </p>
            </>
          )}
        {isProcessingPayment && paypalToken && (
          <div className="mt-6 flex flex-col items-center gap-3 text-gray-600">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm italic">{t("orderProcessingMessage")}</p>
          </div>
        )}

        <Button
          variant="secondary"
          disabled={isProcessingPayment}
          onClick={() => router.push("/", { locale })}
          className="mt-6"
        >
          {t("continueShopping")}
        </Button>
      </div>

      {trustedShopData && <TrustedShopsCheckout {...trustedShopData} />}
    </div>
  );
};

export default OrderPlaced;
