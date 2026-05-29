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
import { AlertTriangle, Loader2, RefreshCcw } from "lucide-react";
import {
  TrustedShopsCheckout,
  TrustedShopsCheckoutProps,
} from "@/components/layout/thank-you/trusted-card";
import {
  formatDateToTrustedShops,
  getOrderLatestDeliveryDate,
} from "@/hooks/get-latest-delivery-date";
import {
  calculateOrderTaxWithDiscount,
  calculateProductVAT,
} from "@/lib/caculate-vat";
import {
  getBrandName,
  getFirstCategoryName,
  getTrackingId,
  toTrackingCsv,
  toTrackingString,
} from "@/components/shared/tracking/tracking-utils";
import { useCheckoutCompleted } from "@/features/affiliate/hook";

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

const getAwinSentKey = (orderRef: string) =>
  `awin_sent_${orderRef || "unknown"}`;
const getDynamicConversionSentKey = (orderRef: string) =>
  `dynamic_conversion_sent_${orderRef || "unknown"}`;
const getDynamicTmSaleSentKey = (orderRef: string) =>
  `dynamic_tm_sale_sent_${orderRef || "unknown"}`;

const normalizeTrackingDomain = (domain?: string | null) =>
  (domain ?? "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

type DynamicTrackingWindow = Window & {
  dynamic_tm_data?: Record<string, string>;
};

const OrderPlaced = () => {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const paymentIntentId = params?.get("payment_intent"); // Lấy param paymentIntent.id nếu có
  const paypalToken = params?.get("token");
  const hasPaymentContext = Boolean(paymentIntentId || paypalToken);

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
  const [homeRedirectCounter, setHomeRedirectCounter] = useState(4);

  const [trustedShopData, setTrustedShopData] =
    useState<TrustedShopsCheckoutProps | null>(null);

  const capturePaymentMutation = useCapturePayment();
  const checkoutCompletedMutation = useCheckoutCompleted();
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

    // ❌ Không có context thanh toán: hiển thị trạng thái + redirect tự động
    if (hasPaymentContext) return;

    if (homeRedirectCounter <= 0) {
      router.replace("/", { locale });
      return;
    }

    const timer = setTimeout(() => {
      setHomeRedirectCounter((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [paramsChecked, hasPaymentContext, homeRedirectCounter, router, locale]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayed(true); // 🔥 sau 3 giây mới cho phép chạy query
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (paramsChecked && !hasPaymentContext) {
      setIsProcessingPayment(false);
    }
  }, [paramsChecked, hasPaymentContext]);

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
    enabled:
      hasPaymentContext &&
      delayed &&
      Boolean(checkoutId) &&
      !hasFetchedRef.current,
    retry: false, // Ta tự retry rồi nên không cần retry của React Query
    queryFn: async () => {
      hasFetchedRef.current = true;

      try {
        if (!paymentIntentId && paymentId && paypalToken) {
          await retryCaptureUntilSuccess(paymentId);
        }

        const checkoutData = await getMainCheckOutByMainCheckOutId(checkoutId!);

        if (checkoutData?.id) {
          try {
            await checkoutCompletedMutation.mutateAsync(checkoutData.id);
          } catch (checkoutCompletedError) {
            console.error("checkoutCompleted failed:", checkoutCompletedError);
          }
        }

        return checkoutData;
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

  const dynamicTrackingDomain = normalizeTrackingDomain(
    process.env.NEXT_PUBLIC_DYNAMIC_TRACKING_DOMAIN,
  );
  const dynamicTrackingCode =
    process.env.NEXT_PUBLIC_DYNAMIC_TRACKING_CODE?.trim() ?? "";

  const checkoutItems = React.useMemo(
    () => checkout?.checkouts?.flatMap((c) => c.cart?.items ?? []) ?? [],
    [checkout],
  );

  const conversionTrackingData = React.useMemo(() => {
    if (!checkout) return null;

    const calc = calculateOrderTaxWithDiscount(
      checkoutItems,
      checkout.voucher_amount ?? 0,
    );

    const amountNetWithoutShipping = Number(calc?.totalNetWithoutShipping ?? 0);
    const amount = Number.isFinite(amountNetWithoutShipping)
      ? amountNetWithoutShipping.toFixed(2)
      : "0.00";

    const country =
      toTrackingString(
        checkout.checkouts?.[0]?.shipping_address?.country ?? "DE",
      ).toUpperCase() || "DE";
    const currency = "EUR";
    const orderRef = toTrackingString(checkout.checkout_code);
    const customerId = getTrackingId(
      checkout.checkouts?.[0]?.user?.user_code,
      checkout.checkouts?.[0]?.user?.id,
    );

    const lineItems = checkoutItems
      .map((item) => {
        const product = item?.products;
        const quantity = Math.max(0, Number(item?.quantity) || 0);
        const lineGross = Math.max(0, Number(item?.final_price) || 0);
        const lineNet = Math.max(
          0,
          Number(calculateProductVAT(lineGross, product?.tax).net) || 0,
        );
        const singleAmount = quantity > 0 ? lineNet / quantity : lineNet;

        const firstCategory = getFirstCategoryName(product?.categories);
        const brandName = getBrandName(product?.brand);

        return {
          productId: getTrackingId(product?.id_provider, product?.id),
          quantity,
          lineAmount: lineNet,
          singleAmount,
          category: firstCategory,
          brand: brandName,
        };
      })
      .filter((item) => item.productId !== "");

    const productIds = toTrackingCsv(lineItems.map((item) => item.productId));
    const productPcs = toTrackingCsv(lineItems.map((item) => item.quantity));
    const singleAmount = toTrackingCsv(
      lineItems.map((item) => item.singleAmount.toFixed(2)),
    );
    const amounts = toTrackingCsv(
      lineItems.map((item) => item.lineAmount.toFixed(2)),
    );
    const quantities = toTrackingCsv(lineItems.map((item) => item.quantity));
    const categories = toTrackingCsv(lineItems.map((item) => item.category));
    const productBrands = toTrackingCsv(lineItems.map((item) => item.brand));
    const levelValues = toTrackingCsv(lineItems.map(() => "product"));
    const totalQuantity = lineItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      amount,
      currency,
      orderRef,
      customerId,
      country,
      productIds,
      productPcs,
      singleAmount,
      amounts,
      quantities,
      categories,
      productBrands,
      levelValues,
      totalQuantity,
      paymentType: toTrackingString(checkout.payment_method),
    };
  }, [checkout, checkoutItems]);

  const awinTrackingData = React.useMemo(() => {
    if (!checkout) return null;

    const orderRef = toTrackingString(checkout.checkout_code);
    if (!orderRef) return null;

    const countryCode = checkout.checkouts?.[0]?.shipping_address?.country ?? "DE";
    const taxId = checkout.checkouts?.[0]?.user?.tax_id ?? null;

    const partsNetTotals: Record<"OWNBRAND" | "DEFAULT", number> = {
      OWNBRAND: 0,
      DEFAULT: 0,
    };

    checkoutItems.forEach((item) => {
      const product = item?.products;
      const quantity = Math.max(0, Number(item?.quantity) || 0);
      const unitGross = Math.max(0, Number(item?.item_price) || 0);
      const lineGross = unitGross * quantity;

      if (lineGross <= 0) return;

      const lineNet = Math.max(
        0,
        Number(calculateProductVAT(lineGross, product?.tax, countryCode, taxId).net) ||
          0,
      );

      const partKey = product?.owner == null ? "OWNBRAND" : "DEFAULT";
      partsNetTotals[partKey] = +(partsNetTotals[partKey] + lineNet).toFixed(2);
    });

    const partEntries = (["OWNBRAND", "DEFAULT"] as const)
      .filter((key) => partsNetTotals[key] > 0)
      .map((key) => `${key}:${partsNetTotals[key].toFixed(2)}`);

    const partsForPixel =
      partEntries.length > 0 ? partEntries.join("|") : "DEFAULT:0.00";
    const partsForMasterTag = `${partsForPixel}|`;
    const amount = (partsNetTotals.OWNBRAND + partsNetTotals.DEFAULT).toFixed(2);

    return {
      orderRef,
      amount,
      partsForMasterTag,
      partsForPixel,
    };
  }, [checkout, checkoutItems]);

  // Gọi hook trực tiếp
  const { data: user } = useGetUserById(userId || "");

  // Luồng xử lý khi có user
  useEffect(() => {
    if (!checkout || !invoice || !user) return;
    if (hasProcessedRef.current) return; // 🔥 tránh chạy lại useEffect

    hasProcessedRef.current = true;

    const process = async () => {
      try {
        const doc = <InvoicePDF checkout={checkout} invoice={invoice} />;
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
    if (!checkout || !awinTrackingData) return;

    const { amount, orderRef, partsForMasterTag, partsForPixel } =
      awinTrackingData;
    const awinSentKey = getAwinSentKey(orderRef);

    // 🔒 chống double fire
    if (sessionStorage.getItem(awinSentKey)) return;

    // 🔥 chỉ track khi có awc
    const awcAwin = localStorage.getItem("awc_awin");
    if (!awcAwin) return;

    let cancelled = false;

    const track = async () => {
      const isReady = await waitForAwinReady();

      // 👉 CASE 1: MasterTag OK → JS Conversion
      if (isReady && !cancelled) {
        (window as any).AWIN.Tracking.Sale = {
          amount,
          orderRef,
          parts: partsForMasterTag,
          currency: "EUR",
          channel: "aw",
          customerAcquisition: "NEW",
          test: "0",
        };

        (window as any).AWIN.Tracking.run();
        sessionStorage.setItem(awinSentKey, "1");
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
          `&parts=${encodeURIComponent(partsForPixel)}` +
          `&ch=aw`;

        img.width = 0;
        img.height = 0;
        img.style.display = "none";

        document.body.appendChild(img);
        sessionStorage.setItem(awinSentKey, "1");
      }
    };

    track();

    return () => {
      cancelled = true;
    };
  }, [checkout, awinTrackingData]);

  // Dynamic Conversion Pixel (SunnySales)
  useEffect(() => {
    if (!checkout || !conversionTrackingData) return;
    if (!dynamicTrackingDomain || !dynamicTrackingCode) return;
    const conversionSentKey = getDynamicConversionSentKey(
      conversionTrackingData.orderRef,
    );
    if (sessionStorage.getItem(conversionSentKey)) return;

    const scriptId = `dynamic-conversion-${conversionTrackingData.orderRef}`;
    if (document.getElementById(scriptId)) return;

    const params = new URLSearchParams({
      dtc: dynamicTrackingCode,
      dt_ttype: "pps",
      dt_rt: "js",
      orderid: conversionTrackingData.orderRef,
      level: "",
      amount: conversionTrackingData.amount,
      currency: conversionTrackingData.currency,
      custid: conversionTrackingData.customerId,
      grouplevel1: "",
      grouplevel2: "",
      comment: "",
      vouchercode: "",
      country: conversionTrackingData.country,
      leadtype: "",
      categories: conversionTrackingData.categories,
      productbrands: conversionTrackingData.productBrands,
      productids: conversionTrackingData.productIds,
      productpcs: conversionTrackingData.productPcs,
      singleamount: conversionTrackingData.singleAmount,
    });

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "text/javascript";
    script.async = true;
    script.src = `https://${dynamicTrackingDomain}/get.aspx?${params.toString()}`;

    script.onerror = () => {
      const iframeId = `${scriptId}-iframe`;
      if (document.getElementById(iframeId)) return;

      const iframeParams = new URLSearchParams(params);
      iframeParams.set("dt_rt", "iframe");

      const iframe = document.createElement("iframe");
      iframe.id = iframeId;
      iframe.height = "0";
      iframe.width = "0";
      iframe.style.display = "none";
      iframe.setAttribute("frameborder", "0");
      iframe.src = `https://${dynamicTrackingDomain}/get.aspx?${iframeParams.toString()}`;
      document.body.appendChild(iframe);
    };

    document.body.appendChild(script);
    sessionStorage.setItem(conversionSentKey, "1");
  }, [
    checkout,
    conversionTrackingData,
    dynamicTrackingCode,
    dynamicTrackingDomain,
  ]);

  // Dynamic Tag Manager: sale event
  useEffect(() => {
    if (!checkout || !conversionTrackingData) return;
    if (!dynamicTrackingDomain || !dynamicTrackingCode) return;
    const tmSaleSentKey = getDynamicTmSaleSentKey(
      conversionTrackingData.orderRef,
    );
    if (sessionStorage.getItem(tmSaleSentKey)) return;

    const scriptId = `dynamic-tm-sale-${conversionTrackingData.orderRef}`;
    if (document.getElementById(scriptId)) return;

    const trackingWindow = window as DynamicTrackingWindow;
    trackingWindow.dynamic_tm_data = {
      type: "sale",
      orderid: conversionTrackingData.orderRef,
      amount: conversionTrackingData.amount,
      custid: conversionTrackingData.customerId,
      currency: conversionTrackingData.currency,
      quantity: String(conversionTrackingData.totalQuantity),
      country: conversionTrackingData.country,
      productids: conversionTrackingData.productIds,
      amounts: conversionTrackingData.amounts,
      quantities: conversionTrackingData.quantities,
      categories: conversionTrackingData.categories,
      levelvalues: conversionTrackingData.levelValues,
      vouchercode: "",
      customerstatus: "",
      paymenttype: conversionTrackingData.paymentType,
    };

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "text/javascript";
    script.async = true;
    script.src =
      `https://${dynamicTrackingDomain}/tm_js.aspx?` +
      `trackid=${encodeURIComponent(dynamicTrackingCode)}` +
      `&mode=2&dt_freetext=&dt_subid1=&dt_subid2=&dt_keywords=`;

    document.body.appendChild(script);
    sessionStorage.setItem(tmSaleSentKey, "1");
  }, [
    checkout,
    conversionTrackingData,
    dynamicTrackingCode,
    dynamicTrackingDomain,
  ]);

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
      (checkout?.checkouts ?? []).flatMap((checkoutGroup) =>
        (checkoutGroup?.cart?.items ?? []).map((item) => ({
          stock: item?.products?.stock,
          inventory: item?.products?.inventory_pos,
          deliveryTime: item?.products?.delivery_time,
        })),
      ),
    ),
  );

  //Trusted shop init
  useEffect(() => {
    if (!checkout) return;
    if (trustedShopData) return; // ❗ chỉ set 1 lần

    const orderNumber = toTrackingString(checkout.checkout_code);
    const buyerEmail = toTrackingString(checkout?.checkouts?.[0]?.user?.email);
    const products = (checkout?.checkouts ?? [])
      .flatMap((checkoutGroup) => checkoutGroup?.cart?.items ?? [])
      .map((item) => item?.products)
      .filter(Boolean);

    if (!orderNumber || !buyerEmail) return;

    setTrustedShopData({
      orderNumber,
      buyerEmail,
      amount: Number(checkout.total_amount ?? 0),
      currency: "EUR",
      paymentType: toTrackingString(checkout.payment_method),
      estimatedDeliveryDate: estimatedDeliveryDate ?? "",
      products,
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

  const showMissingContextState = paramsChecked && !hasPaymentContext;
  const showMissingCheckoutState =
    hasPaymentContext &&
    !isProcessingPayment &&
    !captureFailed &&
    (!checkout || Boolean(error));
  const showSuccessState =
    hasPaymentContext && !isProcessingPayment && !captureFailed && Boolean(checkout);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f8faf7_0%,#f2f5ef_42%,#edf2ea_100%)]">
      <div className="pointer-events-none absolute -left-20 top-12 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto flex min-h-screen w-full items-center justify-center px-4 py-6 md:px-8">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-[#DCE7D5] bg-white/90 shadow-[0_24px_60px_-20px_rgba(46,92,57,0.25)] backdrop-blur">
          <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full border-8 border-secondary/10" />
          <div className="absolute -bottom-24 -right-10 h-56 w-56 rounded-full border-8 border-primary/10" />

          <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 py-10 md:px-10">
            <Image
              src="/new-logo.svg"
              alt="Prestige Home logo"
              width={88}
              height={88}
              priority
              className="h-[72px] w-auto"
            />

            <div className="text-xl font-semibold md:text-2xl">
              <span className="text-secondary">Prestige</span>
              <span className="text-primary">Home</span>
            </div>

            {showMissingContextState && (
              <div className="w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50/90 px-6 py-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-[#2B2B2B]">
                  {t("thankYouNoDataTitle")}
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#555] md:text-base">
                  {t("thankYouNoDataDescription")}
                </p>
                <p className="mt-3 text-sm font-medium text-[#6E7F63]">
                  {t("thankYouNoDataRedirectCountdown", {
                    seconds: homeRedirectCounter,
                  })}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    variant="secondary"
                    onClick={() => router.push("/", { locale })}
                    className="min-w-[180px]"
                  >
                    {t("continueShopping")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/check-out", { locale })}
                    className="min-w-[180px]"
                  >
                    {t("checkout")}
                  </Button>
                </div>
              </div>
            )}

            {showMissingCheckoutState && (
              <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-slate-50/90 px-6 py-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                  <RefreshCcw className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold text-[#2B2B2B]">
                  {t("thankYouNoOrderTitle")}
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#555] md:text-base">
                  {t("thankYouNoOrderDescription")}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="min-w-[180px]"
                  >
                    {t("retryNow")}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push("/", { locale })}
                    className="min-w-[180px]"
                  >
                    {t("continueShopping")}
                  </Button>
                </div>
              </div>
            )}

            {captureFailed && (
              <div className="w-full max-w-2xl rounded-2xl border border-red-200 bg-red-50/90 px-6 py-6 text-center">
                <h2 className="mb-2 text-2xl font-semibold text-red-700">
                  {t("paymentFailedTitle")}
                </h2>
                <p className="text-sm text-red-700/90 md:text-base">
                  {t("paymentFailedMessage")}
                </p>
              </div>
            )}

            {isProcessingPayment && hasPaymentContext && (
              <div className="mt-2 flex flex-col items-center gap-3 text-gray-600">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm italic">{t("orderProcessingMessage")}</p>
              </div>
            )}

            {showSuccessState && (
              <>
                <h1 className="text-center text-4xl font-semibold italic text-gray-700 md:text-6xl">
                  {t("thankYou")}
                </h1>
                <div className="space-y-2 text-center text-base text-gray-600 md:text-lg">
                  <p>{t("orderPlacedMessage")}</p>
                  <p>{t("trackingInfoMessage")}</p>
                  <p>{t("thankYouShopping")}</p>
                </div>
              </>
            )}

            {!showMissingContextState && !showMissingCheckoutState && (
              <Button
                variant="secondary"
                disabled={isProcessingPayment}
                onClick={() => router.push("/", { locale })}
                className="mt-2 min-w-[200px]"
              >
                {t("continueShopping")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {trustedShopData && <TrustedShopsCheckout {...trustedShopData} />}
    </div>
  );
};

export default OrderPlaced;
