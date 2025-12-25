// "use client";

// import React, { useEffect, useState } from "react";
// import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
// import {
//   PaymentRequest,
//   PaymentRequestPaymentMethodEvent,
// } from "@stripe/stripe-js";
// import { useTranslations, useLocale } from "next-intl";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import { useRouter } from "@/src/i18n/navigation";
// import { UseFormReturn } from "react-hook-form";
// import { CreateOrderFormValues } from "@/lib/schema/checkout";
// import CheckoutPaymentUI from "./payment-ui";

// export type CheckoutFormProps = {
//   clientSecret: string | null;
//   setClientSecret: (v: string | null) => void;
//   total?: number;
//   setTotal?: (v: number) => void;
//   openDialog?: boolean;
//   setOpenDialog?: (v: boolean) => void;
//   userEmail?: string;
//   city?: string;
//   address?: string;
//   additionalAddress?: string;
//   postalCode?: string;
//   form: UseFormReturn<CreateOrderFormValues>;
// };

// export default function CheckoutPaymentLogic(props: CheckoutFormProps) {
//   const {
//     clientSecret,
//     setClientSecret,
//     total,
//     openDialog,
//     setOpenDialog,
//     userEmail,
//     form,
//   } = props;

//   const stripe = useStripe();
//   const elements = useElements();
//   const router = useRouter();
//   const t = useTranslations();
//   const locale = useLocale();

//   const selectedMethod = form.watch("payment_method");
//   const { control } = form;

//   const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
//     null,
//   );

//   // ============================
//   // 🔹 Redirect success
//   // ============================
//   const handlePaymentSuccess = (paymentIntentId: string) => {
//     router.push(
//       `https://prestige-home.de/de/thank-you?payment_intent=${paymentIntentId}`,
//       { locale },
//     );
//   };

//   // ============================
//   // 🔹 Cleanup / Reset lỗi
//   // ============================
//   const handlePaymentFail = (msg?: string) => {
//     toast.error(msg || t("paymentFailed"));
//   };

//   // ============================
//   // 🔹 Thay đổi phương thức thanh toán → reset clientSecret
//   // ============================
//   useEffect(() => {
//     // setClientSecret(null);
//     setPaymentRequest(null);
//   }, [selectedMethod]);

//   // ============================
//   // 🔹 Apple Pay / Google Pay / Klarna logic
//   // ============================
//   useEffect(() => {
//     if (!stripe || !clientSecret) return;

//     if (selectedMethod === "card") return;

//     let pr: PaymentRequest | null = null;

//     // ---------------- Apple Pay + Google Pay ----------------
//     if (selectedMethod === "applepay" || selectedMethod === "googlepay") {
//       pr = stripe.paymentRequest({
//         country: "DE",
//         currency: "eur",
//         total: { label: "Prestige Home", amount: total ?? 0 },
//         requestPayerEmail: true,
//         requestPayerName: true,
//       });

//       pr.on("paymentmethod", async (ev: PaymentRequestPaymentMethodEvent) => {
//         try {
//           const { error, paymentIntent } = await stripe.confirmCardPayment(
//             clientSecret,
//             { payment_method: ev.paymentMethod.id },
//             { handleActions: false },
//           );

//           if (error) {
//             ev.complete("fail");
//             handlePaymentFail(error.message);
//             return;
//           }

//           ev.complete("success");

//           if (paymentIntent?.status === "requires_action") {
//             await stripe.confirmCardPayment(clientSecret);
//           }

//           if (paymentIntent?.status === "succeeded") {
//             handlePaymentSuccess(paymentIntent.id);
//           }
//         } catch (e) {
//           ev.complete("fail");
//           handlePaymentFail("Payment failed");
//         }
//       });

//       pr.canMakePayment().then((res) => {
//         if (res) {
//           setPaymentRequest(pr!);
//           pr!.show();
//         } else {
//           handlePaymentFail(t("browserNotSupport"));
//         }
//       });
//     }

//     // ---------------- Klarna ----------------
//     if (selectedMethod === "klarna") {
//       stripe
//         .confirmKlarnaPayment(clientSecret, {
//           payment_method: {
//             billing_details: {
//               email: userEmail || "example@gmail.com",
//               address: { country: "DE" },
//             },
//           },
//           return_url: `https://prestige-home.de/de/thank-you`,
//         })
//         .then(({ error }) => {
//           if (error) handlePaymentFail(error.message);
//         })
//         .catch(() => handlePaymentFail());
//     }

//     return () => {
//       pr?.abort?.();
//     };
//   }, [selectedMethod, stripe, clientSecret]);

//   // ============================
//   // 🔹 Stripe NOT ready → show loader
//   // ============================
//   if (!stripe) return <Loader2 className="animate-spin" />;

//   // ============================
//   // 🔹 Card payment click
//   // ============================
//   const handleCardPay = async () => {
//     if (!stripe || !elements || !clientSecret) {
//       toast.error(t("stripeWating"));
//       return;
//     }

//     const card = elements.getElement(CardElement);
//     if (!card) {
//       toast.error(t("changePayment"));
//       return;
//     }

//     try {
//       const { error, paymentIntent } = await stripe.confirmCardPayment(
//         clientSecret,
//         { payment_method: { card } },
//       );

//       if (error) {
//         handlePaymentFail(error.message);
//         return;
//       }

//       if (paymentIntent?.status === "succeeded") {
//         handlePaymentSuccess(paymentIntent.id);
//       }
//     } catch {
//       handlePaymentFail();
//     }
//   };

//   return (
//     <>
//       <CheckoutPaymentUI
//         control={control}
//         selectedMethod={selectedMethod}
//         onChange={(v) => form.setValue("payment_method", v)}
//         t={t}
//       />

//       {/* CARD DIALOG */}
//       {selectedMethod === "card" && clientSecret && (
//         <Dialog
//           open={openDialog}
//           onOpenChange={setOpenDialog}
//         >
//           <DialogContent className="lg:max-w-[600px]! max-w-11/12">
//             <DialogHeader>
//               <DialogTitle>{t("enterCardDetails")}</DialogTitle>
//             </DialogHeader>

//             <div className="space-y-4">
//               <div className="border rounded-md p-2">
//                 <CardElement options={{ hidePostalCode: true }} />
//               </div>

//               <Button
//                 className="w-full"
//                 onClick={handleCardPay}
//               >
//                 {t("payWithCard")}
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}
//     </>
//   );
// }

// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   useStripe,
//   useElements,
//   PaymentRequestButtonElement,
// } from "@stripe/react-stripe-js";
// import type {
//   PaymentRequest,
//   PaymentRequestPaymentMethodEvent,
// } from "@stripe/stripe-js";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import { useTranslations, useLocale } from "next-intl";

// export interface CheckoutPaymentLogicProps {
//   clientSecret: string | null;
//   selectedMethod: string;
//   total: number; // amount in cents (e.g. 19900 = 199,00€)
//   currency?: string; // default: "eur"
//   userEmail?: string;

//   // callback từ ngoài truyền vào để xử lý tiếp (VD: redirect, update order)
//   onSuccess: (paymentIntentId: string) => void;
//   onFail: (message?: string) => void;
// }

// export default function CheckoutPaymentLogic({
//   clientSecret,
//   selectedMethod,
//   total,
//   currency = "eur",
//   userEmail,
//   onSuccess,
//   onFail,
// }: CheckoutPaymentLogicProps) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const t = useTranslations();
//   const locale = useLocale();
//   const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
//     null,
//   );

//   // ==========================
//   // 🔹 Setup PaymentRequest (Apple Pay / Google Pay)
//   // ==========================
//   useEffect(() => {
//     if (!stripe || !clientSecret) {
//       setPaymentRequest(null);
//       return;
//     }

//     if (selectedMethod !== "applepay" && selectedMethod !== "googlepay") {
//       setPaymentRequest(null);
//       return;
//     }

//     const pr = stripe.paymentRequest({
//       country: "DE",
//       currency,
//       total: {
//         label: "Prestige Home",
//         amount: 100, // total là số nhỏ nhất (cents)
//       },
//       requestPayerEmail: true,
//       requestPayerName: true,
//     });

//     pr.canMakePayment().then((result) => {
//       if (result) {
//         setPaymentRequest(pr);
//       } else {
//         setPaymentRequest(null);
//       }
//     });

//     const handler = async (ev: PaymentRequestPaymentMethodEvent) => {
//       try {
//         if (!stripe || !clientSecret) {
//           ev.complete("fail");
//           onFail(t("stripeWating"));
//           return;
//         }

//         const { error, paymentIntent } = await stripe.confirmCardPayment(
//           clientSecret,
//           {
//             payment_method: ev.paymentMethod.id,
//           },
//           {
//             handleActions: false,
//           },
//         );

//         if (error) {
//           ev.complete("fail");
//           onFail(error.message);
//           return;
//         }

//         ev.complete("success");

//         if (paymentIntent?.status === "requires_action") {
//           const { error: actionError, paymentIntent: finalPI } =
//             await stripe.confirmCardPayment(clientSecret);

//           if (actionError) {
//             onFail(actionError.message);
//             return;
//           }

//           if (finalPI?.status === "succeeded") {
//             onSuccess(finalPI.id);
//           }
//         } else if (paymentIntent?.status === "succeeded") {
//           onSuccess(paymentIntent.id);
//         }
//       } catch (err) {
//         ev.complete("fail");
//         onFail(t("paymentFailed"));
//       }
//     };

//     pr.on("paymentmethod", handler);

//     return () => {
//       // types có .off, nhưng nếu TS kêu lỗi có thể bỏ cleanup cũng được
//       pr.off("paymentmethod", handler);
//     };
//   }, [
//     stripe,
//     clientSecret,
//     selectedMethod,
//     total,
//     currency,
//     onSuccess,
//     onFail,
//     t,
//   ]);

//   // ==========================
//   // 🔹 Helper
//   // ==========================
//   if (!stripe || !clientSecret) {
//     return (
//       <div className="flex justify-center py-6">
//         <Loader2 className="animate-spin" />
//       </div>
//     );
//   }

//   // ==========================
//   // 🔹 CARD
//   // ==========================
//   if (selectedMethod === "card") {
//     // Card được xử lý qua CardDialog + CardElement (component khác)
//     // Logic ở đây không cần render gì, vì CardDialog đã làm việc đó.
//     return null;
//   }

//   // ==========================
//   // 🔹 KLARNA
//   // ==========================
//   const handleKlarnaPay = async () => {
//     if (!stripe || !clientSecret) {
//       onFail(t("stripeWating"));
//       return;
//     }

//     try {
//       const { error } = await stripe.confirmKlarnaPayment(clientSecret, {
//         payment_method: {
//           billing_details: {
//             email: userEmail || undefined,
//             address: {
//               country: "DE",
//             },
//           },
//         },
//         return_url: `https://prestige-home.de/${locale}/thank-you`,
//       });

//       if (error) {
//         onFail(error.message);
//       }

//       // Klarna sẽ tự redirect → thành công/failed xử lý ở return_url hoặc webhook
//     } catch {
//       onFail(t("paymentFailed"));
//     }
//   };

//   if (selectedMethod === "klarna") {
//     return (
//       <div className="space-y-4">
//         <Button
//           className="w-full py-4"
//           type="button"
//           onClick={handleKlarnaPay}
//         >
//           {t("payWithKlarna")}
//         </Button>
//       </div>
//     );
//   }

//   // ==========================
//   // 🔹 APPLE PAY / GOOGLE PAY
//   // ==========================
//   if (selectedMethod === "applepay" || selectedMethod === "googlepay") {
//     if (!paymentRequest) {
//       return (
//         <p className="text-sm text-muted-foreground">
//           {t("browserNotSupport")}
//         </p>
//       );
//     }

//     return (
//       <div className="space-y-4">
//         <PaymentRequestButtonElement
//           options={{
//             paymentRequest,
//             style: {
//               paymentRequestButton: {
//                 type: "default",
//                 // theme & height nếu muốn
//               },
//             },
//           }}
//         />
//       </div>
//     );
//   }

//   // fallback nếu có method lạ
//   return null;
// }

"use client";

import { useEffect, useRef, useState } from "react";
import {
  PaymentRequestButtonElement,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import type { PaymentRequest } from "@stripe/stripe-js";

export interface CheckoutPaymentLogicProps {
  clientSecret: string;
  selectedMethod: string;
  total: number; // cents
  currency?: string;
  userEmail?: string;
  onSuccess: (paymentIntentId: string) => void;
  onFail: (message?: string) => void;
}

export default function CheckoutPaymentLogic({
  clientSecret,
  selectedMethod,
  total,
  currency = "eur",
  userEmail,
  onSuccess,
  onFail,
}: CheckoutPaymentLogicProps) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null,
  );
  const t = useTranslations();
  const paymentRequestRef = useRef<PaymentRequest | null>(null);

  useEffect(() => {
    if (!stripe) return;
    console.log("stripe");
    // ======================
    // CLEANUP TRƯỚC KHI TẠO MỚI
    // ======================
    if (paymentRequestRef.current) {
      try {
        paymentRequestRef.current.off("paymentmethod");
        paymentRequestRef.current.abort?.();
        // Trick để force destroy object tránh ghost listeners
        (paymentRequestRef.current as any)._events = {};
        paymentRequestRef.current = null;
      } catch {}
    }

    if (selectedMethod !== "applepay" && selectedMethod !== "googlepay") {
      paymentRequestRef.current = null;
      return;
    }

    console.log("payment");

    // ======================
    // CREATE NEW PAYMENT REQUEST
    // ======================
    const pr = stripe.paymentRequest({
      country: "DE",
      currency,
      total: { label: "Prestige Home", amount: total },
      requestPayerEmail: true,
      requestPayerName: true,
    });

    console.log("has payment");

    // gán vào ref
    paymentRequestRef.current = pr;

    console.log(pr);

    // CHECK SUPPORT
    pr.canMakePayment().then((res) => {
      console.log("canMakePayment result:", res);

      if (res && (res.applePay || res.googlePay || res.browser)) {
        setPaymentRequest(pr);
        console.log("support");
      } else {
        console.log("no support");
        setPaymentRequest(null);
      }
    });

    const handler = async (ev: any) => {
      try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        );

        if (error) {
          ev.complete("fail");
          return onFail(error.message);
        }

        ev.complete("success");

        if (paymentIntent?.status === "requires_action") {
          const result = await stripe.confirmCardPayment(clientSecret);
          if (result.error) return onFail(result.error.message);
          if (result.paymentIntent?.status === "succeeded")
            onSuccess(result.paymentIntent.id);
        } else if (paymentIntent?.status === "succeeded") {
          onSuccess(paymentIntent.id);
        }
      } catch (e) {
        ev.complete("fail");
        onFail("Payment failed");
      }
    };

    pr.on("paymentmethod", handler);

    // CLEANUP
    return () => {
      if (paymentRequestRef.current) {
        paymentRequestRef.current.off("paymentmethod", handler);
        paymentRequestRef.current.abort?.();
        (paymentRequestRef.current as any)._events = {}; // CLEAN ALL
        paymentRequestRef.current = null;
      }
    };
  }, [stripe, selectedMethod, clientSecret, total]);

  // ❗ Chỉ hiển thị toast khi phương thức đã chọn nhưng PaymentRequest NULL
  useEffect(() => {
    if (
      (selectedMethod === "applepay" || selectedMethod === "googlepay") &&
      stripe &&
      paymentRequest === null
    ) {
      onFail(t("browserNotSupport"));
    }
  }, [selectedMethod, stripe, paymentRequest]);

  // UI Payment Request Button
  if (selectedMethod === "applepay" || selectedMethod === "googlepay") {
    if (!paymentRequest) return null;

    return (
      <div className="py-4">
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: { paymentRequestButton: { type: "default" } },
          }}
        />
      </div>
    );
  }

  return null;
}
