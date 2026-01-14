// hooks/checkout/useCheckoutSubmit.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAtom } from "jotai";
import { checkOutIdAtom, paymentIdAtom } from "@/store/payment";
import {
  useCreateAddress,
  useCreateInvoiceAddress,
  useUpdateInvoiceAddress,
} from "@/features/address/hook";
import { useCreateCheckOut } from "@/features/checkout/hook";
import { useCreatePayment } from "@/features/payment/hook";
import { useSignUpGuess } from "@/features/auth/hook";
import { getCartByUserId } from "@/features/cart/api";
import { normalizeCartItems } from "@/hooks/caculate-shipping";
import { mapToSupplierCarts } from "@/hooks/map-cart-to-supplier";
import { CreateOrderFormValues } from "@/lib/schema/checkout";
import { CartResponse } from "@/types/cart";
import { Address } from "@/types/address";
import { useSyncLocalCartCheckOut } from "@/features/cart/hook";
import { UseFormReturn } from "react-hook-form";
import { User } from "@/types/user";
import { CartItemLocal } from "@/lib/utils/cart";
import { sendOtp } from "@/features/auth/api";
import { userIdAtom, userIdGuestAtom } from "@/store/auth";
import { currentVoucherAtom } from "@/store/voucher";

export function useCheckoutSubmit({
  form,
  user,
  addresses,
  invoiceAddress,
  cartItems,
  localCart,
  shippingCost,
  locale,
  currentUserId,
}: {
  form: UseFormReturn<CreateOrderFormValues>; // form RHF
  user: User | undefined; // user login hoặc guest
  addresses: Address[] | undefined; // danh sách address shipping
  invoiceAddress: Address | undefined; // invoice address
  cartItems: CartResponse | undefined; // cart server (mảng supplier)
  localCart: CartItemLocal[]; // cart local (guest)
  shippingCost: number; // shipping được tính từ logic
  locale: string; // locale hiện tại
  currentUserId: string;
}) {
  const router = useRouter();
  const t = useTranslations();
  const [userLoginId, setUserLoginId] = useAtom(userIdAtom);
  const [userGuestId, setUserGuestId] = useAtom(userIdGuestAtom);

  const [paymentId, setPaymentId] = useAtom(paymentIdAtom);
  const [checkoutId, setCheckoutId] = useAtom(checkOutIdAtom);
  const [voucherId, setVoucherId] = useAtom(currentVoucherAtom);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [openCardDialog, setOpenCardDialog] = useState(false);
  const [openBankDialog, setOpenBankDialog] = useState(false);
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [pendingData, setPendingData] = useState<CreateOrderFormValues | null>(
    null,
  );

  const createCheckOut = useCreateCheckOut();
  const createPayment = useCreatePayment();
  const createUser = useSignUpGuess();
  const createInvoice = useCreateInvoiceAddress();
  const updateInvoice = useUpdateInvoiceAddress();
  const createShipping = useCreateAddress();
  const syncLocalCart = useSyncLocalCartCheckOut();

  const submitting =
    createCheckOut.isPending ||
    createInvoice.isPending ||
    createPayment.isPending ||
    createShipping.isPending ||
    createUser.isPending;

  // =====================================================================================
  // STEP 1 — Submit lần đầu → chỉ check email + mở OTP dialog
  // =====================================================================================
  const handleOTP = useCallback(
    async (data: CreateOrderFormValues) => {
      try {
        const isDifferentEmail = user?.email && user.email !== data.email;

        if (!userLoginId || isDifferentEmail) {
          await sendOtp(data.email);
          setPendingData(data);
          setOtpEmail(data.email);
          setOpenOtpDialog(true);
          return;
        }

        // Case 3: Logged-in user, same email
        setPendingData(data);
        handleSubmit(data);
      } catch (err) {
        console.error(err);
        toast.error(t("orderFail"));
      }
    },
    [user],
  );

  const verifyOtp = useCallback(() => {
    if (!pendingData) return;
    handleSubmit(pendingData); // chạy tiếp phần checkout thật
    setPendingData(null);
  }, [pendingData]);

  const handleSubmit = useCallback(
    async (data: CreateOrderFormValues) => {
      let cleanupNeeded = false;

      try {
        let finalUserId = user?.id;
        let invoiceId = invoiceAddress?.id;
        let shippingId = addresses?.find((a: Address) => a.is_default)?.id;
        let cartData: CartResponse = [];
        let shippingCostCurrent = 0;
        let currentGuestId = null;

        if (!userLoginId) {
          const newUser = await createUser.mutateAsync({
            first_name: data.first_name ?? "",
            last_name: data.last_name ?? "",
            email: data.email,
            phone_number: data.phone_number,
            company_name: data.company_name ?? null,
            tax_id: data.tax_id ?? null,
            is_real: false,
          });

          finalUserId = newUser.id;
          currentGuestId = newUser.id;
          cleanupNeeded = true;

          localStorage.setItem("access_token", newUser.access_token);
          // setUserLoginId(newUser.id);
          setUserGuestId(newUser.id);
          // setUserLoginId(newUser.id);
        }

        // STEP 2 — Always sync cart after we know finalUserId
        if (!userLoginId) {
          await syncLocalCart.mutateAsync({
            isCheckOut: true,
            user_id: currentGuestId ?? "", // userGuestId
          });
        }

        cartData = await getCartByUserId(finalUserId ?? "");

        const normalized = normalizeCartItems(
          cartData.flatMap((g) => g.items),
          true,
        );

        // Invoice
        if (!invoiceId) {
          const created = await createInvoice.mutateAsync({
            user_id: finalUserId ?? "",
            recipient_name:
              data.company_name?.trim() ||
              `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
            email: data.email ?? "",
            postal_code: data.invoice_postal_code,
            phone_number: data.phone_number,
            address_line: data.invoice_address_line,
            additional_address_line: data.invoice_address_additional,
            city: data.invoice_city,
            country: data.invoice_country,
            state: data.invoice_city,
          });
          invoiceId = created.id;
        } else if (
          data.invoice_address_line !== invoiceAddress?.address_line ||
          data.invoice_postal_code !== invoiceAddress?.postal_code ||
          data.invoice_city !== invoiceAddress?.city ||
          data.phone_number !== invoiceAddress?.phone_number ||
          data.invoice_address_additional !==
            invoiceAddress?.additional_address_line ||
          data.invoice_country !== invoiceAddress?.country
        ) {
          const updated = await updateInvoice.mutateAsync({
            addressId: invoiceId,
            address: {
              user_id: finalUserId ?? "",
              recipient_name:
                data.company_name?.trim() ||
                `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
              email: data.email ?? "",
              postal_code: data.invoice_postal_code,
              phone_number: data.phone_number,
              address_line: data.invoice_address_line,
              additional_address_line: data.invoice_address_additional,
              city: data.invoice_city,
              country: data.invoice_country,
              state: data.invoice_city,
            },
          });
          invoiceId = updated.id;
        }

        // Shipping
        // if (!shippingId) {
        const created = await createShipping.mutateAsync({
          user_id: finalUserId ?? "",
          recipient_name: data.shipping_recipient_name ?? "",
          email: data.email ?? "",
          postal_code: data.shipping_postal_code,
          phone_number: data.shipping_phone_number ?? "",
          address_line: data.shipping_address_line,
          additional_address_line: data.shipping_address_additional,
          city: data.shipping_city,
          country: data.shipping_country,
          is_default: true,
        });
        shippingId = created.id;
        // }

        // Checkout
        const checkout = await createCheckOut.mutateAsync({
          ...data,
          invoice_address_id: invoiceId,
          shipping_address_id: shippingId,
          supplier_carts: mapToSupplierCarts(cartItems ?? cartData),
          note: data.note,
          total_shipping:
            shippingCostCurrent > 0 ? shippingCostCurrent : shippingCost,
          carrier: normalized.find(
            (i) =>
              i.carrier.toLowerCase() === "amm" ||
              i.carrier.toLowerCase() === "spedition",
          )
            ? "spedition"
            : "dpd",
        });

        // toast.success(t("orderSuccess"));
        setCheckoutId(checkout.id);
        setVoucherId(null);
        // Payment flow

        // ===========================
        // PAYMENT FLOW (Stripe + PayPal + Bank)
        // ===========================
        if (data.payment_method !== "bank") {
          const payment = await createPayment.mutateAsync({
            checkout_id: checkout.id,
            pay_channel: data.payment_method,
          });

          setPaymentId(payment.payment_order_id);
          setTotal(payment.amount);
          setClientSecret(payment.clientSecret);

          const method = data.payment_method;

          if (method === "paypal") {
            router.push(payment.approve_url, { locale });
            return;
          }

          if (method === "card") {
            setOpenCardDialog(true);
            return;
          }

          // Klarna → auto confirm trong StripeLayout
          if (method === "klarna") {
            return;
          }

          // Apple Pay / Google Pay → auto render PaymentRequestButton
          if (method === "applepay" || method === "googlepay") {
            return;
          }
        } else {
          setOpenBankDialog(true);
        }

        cleanupNeeded = false;
      } catch (err) {
        console.error(err);
        toast.error(t("orderFail"));
        setCheckoutId("");
        // form.reset();
        cleanupNeeded = true;
        setUserLoginId(null);
        setUserGuestId(null);
        localStorage.removeItem("access_token");
      } finally {
        const guestId = localStorage.getItem("userIdGuest");

        if (cleanupNeeded && guestId !== null) {
          // localStorage.removeItem("userIdGuest");
          // localStorage.removeItem("access_token");
        }
      }
    },
    [
      user,
      addresses,
      invoiceAddress,
      cartItems,
      localCart,
      shippingCost,
      locale,
    ],
  );

  return {
    submitting,
    clientSecret,
    total,
    openCardDialog,
    openBankDialog,
    openOtpDialog,
    otpEmail,

    setClientSecret,
    setTotal,
    setOpenCardDialog,
    setOpenBankDialog,
    setOpenOtpDialog,

    handleOTP,
    handleSubmit,
    verifyOtp,
  };
}
