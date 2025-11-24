// hooks/checkout/useCheckoutSubmit.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAtom } from "jotai";
import { checkOutIdAtom, paymentIdAtom } from "@/store/payment";
import {
  useCreateAddress,
  useCreateInvoiceAddress,
  useUpdateInvoiceAddress,
} from "@/features/address/hook";
import { useCreateCheckOut } from "@/features/checkout/hook";
import { useCreatePayment } from "@/features/payment/hook";
import { useCheckMailExist, useSignUpGuess } from "@/features/auth/hook";
import { getCartByUserId } from "@/features/cart/api";
import {
  normalizeCartItems,
  calculateShipping,
} from "@/hooks/caculate-shipping";
import { mapToSupplierCarts } from "@/hooks/map-cart-to-supplier";
import { CreateOrderFormValues } from "@/lib/schema/checkout";
import { CartItem, CartResponse } from "@/types/cart";
import { Address } from "@/types/address";
import { useSyncLocalCart } from "@/features/cart/hook";
import { UseFormReturn } from "react-hook-form";
import { Customer, User } from "@/types/user";
import { CartItemLocal } from "@/lib/utils/cart";

export function useCheckoutSubmit({
  form,
  user,
  addresses,
  invoiceAddress,
  cartItems,
  localCart,
  hasServerCart,
  shippingCost,
  locale,
}: {
  form: UseFormReturn<CreateOrderFormValues>; // form RHF
  user: User | undefined; // user login hoặc guest
  addresses: Address[] | undefined; // danh sách address shipping
  invoiceAddress: Address | undefined; // invoice address
  cartItems: CartResponse | undefined; // cart server (mảng supplier)
  localCart: CartItemLocal[]; // cart local (guest)
  hasServerCart: boolean; // flag cart server hay local
  shippingCost: number; // shipping được tính từ logic
  locale: string; // locale hiện tại
}) {
  const router = useRouter();
  const t = useTranslations();

  const [paymentId, setPaymentId] = useAtom(paymentIdAtom);
  const [checkoutId, setCheckoutId] = useAtom(checkOutIdAtom);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [openCardDialog, setOpenCardDialog] = useState(false);
  const [openBankDialog, setOpenBankDialog] = useState(false);
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const createCheckOut = useCreateCheckOut();
  const createPayment = useCreatePayment();
  const createUser = useSignUpGuess();
  const createInvoice = useCreateInvoiceAddress();
  const updateInvoice = useUpdateInvoiceAddress();
  const createShipping = useCreateAddress();
  const syncLocalCart = useSyncLocalCart(true);
  const checkEmail = useCheckMailExist();

  const submitting =
    createCheckOut.isPending ||
    createInvoice.isPending ||
    createPayment.isPending ||
    createShipping.isPending ||
    createUser.isPending;

  const handleSubmit = useCallback(
    async (data: CreateOrderFormValues) => {
      let cleanupNeeded = false;

      try {
        let finalUserId = user?.id;
        let invoiceId = invoiceAddress?.id;
        let shippingId = addresses?.find((a: Address) => a.is_default)?.id;
        const invoiceCountry = invoiceAddress?.country;

        let cartData: CartResponse = [];
        let shippingCostCurrent = 0;

        // Guest checkout
        if (data.email && !finalUserId) {
          const exists = await checkEmail.mutateAsync(data.email);

          if (!exists) {
            // redirect to OTP
            setOtpEmail(data.email);
            setOpenOtpDialog(true);
            cleanupNeeded = true;
            return;
          }

          const newUser = await createUser.mutateAsync({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone_number: data.phone_number,
          });

          finalUserId = newUser.id;
          cleanupNeeded = true;

          localStorage.setItem("access_token", newUser.access_token);
          localStorage.setItem("userIdGuest", newUser.id);

          await syncLocalCart.mutateAsync();
          cartData = await getCartByUserId(newUser.id);

          const normalized = normalizeCartItems(
            cartData.flatMap((g) => g.items),
            true,
          );
          shippingCostCurrent = calculateShipping(normalized);
        }

        // Invoice
        if (!invoiceCountry || !invoiceId) {
          const created = await createInvoice.mutateAsync({
            user_id: finalUserId ?? "",
            recipient_name: `${data.first_name} ${data.last_name}`,
            postal_code: data.invoice_postal_code,
            phone_number: data.phone_number,
            address_line: data.invoice_address_line,
            city: data.invoice_city,
            country: data.invoice_city,
            state: data.invoice_city,
          });
          invoiceId = created.id;
        } else if (
          data.invoice_address_line !== invoiceAddress?.address_line ||
          data.invoice_postal_code !== invoiceAddress?.postal_code ||
          data.invoice_city !== invoiceAddress?.city ||
          data.phone_number !== invoiceAddress?.phone_number
        ) {
          const updated = await updateInvoice.mutateAsync({
            addressId: invoiceId,
            address: {
              user_id: finalUserId ?? "",
              recipient_name: `${data.first_name} ${data.last_name}`,
              postal_code: data.invoice_postal_code,
              phone_number: data.phone_number,
              address_line: data.invoice_address_line,
              city: data.invoice_city,
              country: data.invoice_city,
              state: data.invoice_city,
            },
          });
          invoiceId = updated.id;
        }

        // Shipping
        if (!shippingId) {
          const created = await createShipping.mutateAsync({
            user_id: finalUserId ?? "",
            recipient_name: `${data.first_name} ${data.last_name}`,
            postal_code: data.invoice_postal_code,
            phone_number: data.phone_number,
            address_line: data.invoice_address_line,
            city: data.shipping_city,
            country: data.shipping_city,
            is_default: true,
            state: data.shipping_city,
          });
          shippingId = created.id;
        }

        // Checkout
        const checkout = await createCheckOut.mutateAsync({
          ...data,
          invoice_address_id: invoiceId,
          shipping_address_id: shippingId,
          supplier_carts: mapToSupplierCarts(cartItems ?? cartData),
          note: data.note,
          total_shipping:
            shippingCostCurrent > 0 ? shippingCostCurrent : shippingCost,
        });

        toast.success(t("orderSuccess"));
        setCheckoutId(checkout.id);

        // Payment flow
        if (data.payment_method !== "bank") {
          const payment = await createPayment.mutateAsync({
            checkout_id: checkout.id,
            pay_channel: data.payment_method,
          });

          setPaymentId(payment.payment_order_id);

          if (data.payment_method === "paypal") {
            router.push(payment.approve_url, { locale });
          } else if (data.payment_method === "card") {
            setOpenCardDialog(true);
          }
          setTotal(payment.amount);
          setClientSecret(payment.clientSecret);
        } else {
          setOpenBankDialog(true);
        }

        cleanupNeeded = false;
      } catch (err) {
        console.error(err);
        toast.error(t("orderFail"));
        form.reset();
        cleanupNeeded = true;
      } finally {
        if (cleanupNeeded && localStorage.getItem("userIdGuest")) {
          localStorage.removeItem("userIdGuest");
          localStorage.removeItem("access_token");
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

    handleSubmit,
  };
}
