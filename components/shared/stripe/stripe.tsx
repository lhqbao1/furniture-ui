// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   Elements,
//   CardElement,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
// import {
//   loadStripe,
//   PaymentRequest,
//   PaymentRequestPaymentMethodEvent,
// } from "@stripe/stripe-js";

// import { useFormContext, UseFormReturn } from "react-hook-form";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form";
// import Image from "next/image";
// import { paymentOptions } from "@/data/data";
// import { useLocale, useTranslations } from "next-intl";
// import { useRouter } from "@/src/i18n/navigation";
// import { toast } from "sonner";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Loader2 } from "lucide-react";
// import { CreateOrderFormValues } from "@/lib/schema/checkout"; // ✅ import type form

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

// export type PaymentMethod = "card" | "applepay" | "googlepay" | "klarna";

// interface CheckoutFormProps {
//   clientSecret: string | null;
//   setClientSecret: React.Dispatch<React.SetStateAction<string | null>>;
//   total?: number;
//   setTotal?: React.Dispatch<React.SetStateAction<number>>;
//   openDialog?: boolean;
//   setOpenDialog?: React.Dispatch<React.SetStateAction<boolean>>;
//   userEmail?: string;
//   city?: string;
//   address?: string;
//   additionalAddress?: string;
//   postalCode?: string;
//   form: UseFormReturn<CreateOrderFormValues>; // ✅ type-safe form
// }

// function CheckoutForm({
//   clientSecret,
//   setClientSecret,
//   total,
//   openDialog,
//   setOpenDialog,
//   userEmail,
//   address,
//   additionalAddress,
//   postalCode,
//   form,
// }: CheckoutFormProps) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const { control, watch } = useFormContext();
//   const selectedMethod = watch("payment_method");
//   const t = useTranslations();
//   const router = useRouter();
//   const locale = useLocale();

//   const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
//     null,
//   );

//   const handlePaymentSuccess = (paymentIntentId: string) => {
//     // Redirect sang trang kết quả và gửi PaymentIntent.id vào query
//     router.push(
//       `http://prestige-home.de/thank-you?payment_intent=${paymentIntentId}`,
//       { locale },
//     );
//   };

//   /** ✅ Cleanup helper */
//   const handlePaymentFail = (message?: string) => {
//     toast.error(message || t("paymentFailed"));

//     // 🧹 Xóa userIdGuest nếu có
//     if (localStorage.getItem("userIdGuest")) {
//       localStorage.removeItem("userIdGuest");
//       localStorage.removeItem("access_token");
//     }

//     // 🔄 Reset form
//     form.reset();
//   };

//   // Reset clientSecret & PaymentRequest khi đổi phương thức
//   useEffect(() => {
//     setClientSecret(null);
//     setPaymentRequest(null);
//   }, [selectedMethod, setClientSecret]);

//   // PaymentRequest logic (Apple/Google Pay)
//   useEffect(() => {
//     if (!stripe || !clientSecret) return;

//     // Reset paymentRequest cũ
//     if (paymentRequest) {
//       paymentRequest.abort?.();
//       setPaymentRequest(null);
//     }

//     // Apple / Google Pay
//     /** ✅ Apple / Google Pay */
//     if (selectedMethod === "applepay" || selectedMethod === "googlepay") {
//       const pr = stripe.paymentRequest({
//         country: "DE",
//         currency: "eur",
//         total: { label: "Econelo Payment", amount: total ?? 0 },
//         requestPayerName: true,
//         requestPayerEmail: true,
//       });

//       const handlePaymentMethod = async (
//         ev: PaymentRequestPaymentMethodEvent,
//       ) => {
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
//           } else {
//             handlePaymentFail();
//           }
//         } catch (err) {
//           ev.complete("fail");
//           console.error(err);
//           handlePaymentFail(t("paymentFailed"));
//         }
//       };

//       pr.on("paymentmethod", handlePaymentMethod);

//       pr.canMakePayment().then((result) => {
//         if (result) {
//           setPaymentRequest(pr);
//           pr.show();
//         } else {
//           handlePaymentFail(t("browserNotSupport"));
//           setClientSecret(null);
//         }
//       });

//       pr.on("cancel", () => {
//         handlePaymentFail(t("paymentCancelled"));
//         setClientSecret(null);
//       });

//       return () => {
//         pr.off("paymentmethod", handlePaymentMethod);
//         pr.abort?.();
//       };
//     }

//     // Klarna
//     if (selectedMethod === "klarna") {
//       console.log("klarna");
//       const confirmKlarna = async () => {
//         try {
//           const { error } = await stripe.confirmKlarnaPayment(clientSecret, {
//             payment_method: {
//               billing_details: {
//                 email: userEmail ?? "example@gmail.com",
//                 address: { country: "DE" },
//               },
//             },
//             return_url: `https://www.prestige-home.de/thank-you`,
//           });

//           if (error) {
//             // Nếu có lỗi ngay lập tức (VD: không đủ thông tin, không support Klarna)
//             handlePaymentFail(error.message || t("klarnaNotAllow"));
//             router.push("/check-out", { locale });
//           }
//         } catch (err) {
//           console.error(err);
//           handlePaymentFail(t("klarnaNotAllow"));
//           router.push("https://www.prestige-home.de/check-out", { locale });
//         }
//       };
//       confirmKlarna();
//     }
//   }, [stripe, clientSecret, selectedMethod, total]);

//   if (!stripe || !elements) return <Loader2 className="animate-spin" />;

//   /** ✅ Card Payment */
//   const handleCardPay = async () => {
//     if (!stripe || !elements || !clientSecret) return;
//     const card = elements.getElement(CardElement);
//     if (!card) return;

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
//       } else {
//         handlePaymentFail();
//       }
//     } catch (err) {
//       console.error(err);
//       handlePaymentFail(t("paymentFailed"));
//     }
//   };

//   return (
//     <Card className="mx-auto p-4 shadow-lg">
//       <CardHeader>
//         <div className="font-bold text-base">{t("selectPayment")}</div>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <FormField
//           control={control}
//           name="payment_method"
//           render={({ field }) => (
//             <FormItem>
//               <FormControl>
//                 <RadioGroup
//                   className="grid grid-cols-1 gap-y-3"
//                   value={field.value}
//                   onValueChange={(val) => field.onChange(val)}
//                 >
//                   {paymentOptions.map((option) => (
//                     <FormItem
//                       key={option.id}
//                       className="flex items-center gap-2 space-y-0"
//                     >
//                       <FormControl>
//                         <RadioGroupItem
//                           value={option.id}
//                           id={option.id}
//                         />
//                       </FormControl>
//                       <FormLabel
//                         htmlFor={option.id}
//                         className="flex items-center gap-2 cursor-pointer"
//                       >
//                         {option.logo && (
//                           <Image
//                             src={option.logo}
//                             width={30}
//                             height={30}
//                             alt={option.label}
//                             unoptimized
//                           />
//                         )}
//                         <span>{option.label}</span>
//                       </FormLabel>
//                     </FormItem>
//                   ))}
//                 </RadioGroup>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {selectedMethod === "card" && clientSecret && (
//           <Dialog
//             open={openDialog}
//             onOpenChange={setOpenDialog}
//           >
//             <DialogContent className="sm:max-w-md">
//               <DialogHeader>
//                 <DialogTitle>{t("enterCardDetails")}</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div className="border rounded-md p-2">
//                   <CardElement options={{ hidePostalCode: true }} />
//                 </div>
//                 <Button
//                   type="button"
//                   className="w-full"
//                   onClick={handleCardPay}
//                 >
//                   {t("payWithCard")}
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// function StripeLayout(props: CheckoutFormProps) {
//   return (
//     <Elements stripe={stripePromise}>
//       <CheckoutForm {...props} />
//     </Elements>
//   );
// }

// export default React.memo(StripeLayout);

// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   Elements,
//   CardElement,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
// import {
//   loadStripe,
//   PaymentRequest,
//   PaymentRequestPaymentMethodEvent,
// } from "@stripe/stripe-js";

// import { UseFormReturn } from "react-hook-form";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import {
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form";
// import Image from "next/image";
// import { paymentOptions } from "@/data/data";
// import { useLocale, useTranslations } from "next-intl";
// import { useRouter } from "@/src/i18n/navigation";
// import { toast } from "sonner";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Loader2 } from "lucide-react";
// import { CreateOrderFormValues } from "@/lib/schema/checkout";

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

// export type PaymentMethod = "card" | "applepay" | "googlepay" | "klarna";

// interface CheckoutFormProps {
//   clientSecret: string | null;
//   setClientSecret: React.Dispatch<React.SetStateAction<string | null>>;
//   total?: number;
//   setTotal?: React.Dispatch<React.SetStateAction<number>>;
//   openDialog?: boolean;
//   setOpenDialog?: React.Dispatch<React.SetStateAction<boolean>>;
//   userEmail?: string;
//   city?: string;
//   address?: string;
//   additionalAddress?: string;
//   postalCode?: string;
//   form: UseFormReturn<CreateOrderFormValues>;
// }

// /* -------------------------------------------------------
//  * 1) UI chọn phương thức thanh toán (nhẹ, luôn render được)
//  * -----------------------------------------------------*/
// function PaymentMethods({
//   form,
//   t,
// }: {
//   form: UseFormReturn<CreateOrderFormValues>;
//   t: ReturnType<typeof useTranslations>;
// }) {
//   return (
//     <FormField
//       control={form.control}
//       name="payment_method"
//       render={({ field }) => (
//         <FormItem>
//           <FormControl>
//             <RadioGroup
//               className="grid grid-cols-1 gap-y-3"
//               value={field.value}
//               onValueChange={(val) => field.onChange(val)}
//             >
//               {paymentOptions.map((option) => (
//                 <FormItem
//                   key={option.id}
//                   className="flex items-center gap-2 space-y-0"
//                 >
//                   <FormControl>
//                     <RadioGroupItem
//                       value={option.id}
//                       id={option.id}
//                     />
//                   </FormControl>
//                   <FormLabel
//                     htmlFor={option.id}
//                     className="flex items-center gap-2 cursor-pointer"
//                   >
//                     {option.logo && (
//                       <Image
//                         src={option.logo}
//                         width={30}
//                         height={30}
//                         alt={option.label}
//                         unoptimized
//                       />
//                     )}
//                     <span>{option.label}</span>
//                   </FormLabel>
//                 </FormItem>
//               ))}
//             </RadioGroup>
//           </FormControl>
//           <FormMessage />
//         </FormItem>
//       )}
//     />
//   );
// }

// /* -------------------------------------------------------
//  * 2) CheckoutForm – chứa logic Stripe, nhưng KHÔNG chặn UI
//  * -----------------------------------------------------*/
// function CheckoutForm({
//   clientSecret,
//   setClientSecret,
//   total,
//   openDialog,
//   setOpenDialog,
//   userEmail,
//   address,
//   additionalAddress,
//   postalCode,
//   form,
// }: CheckoutFormProps) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const { watch } = form;
//   const selectedMethod = watch("payment_method");
//   const t = useTranslations();
//   const router = useRouter();
//   const locale = useLocale();

//   const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
//     null,
//   );

//   const handlePaymentSuccess = (paymentIntentId: string) => {
//     // Redirect sang trang kết quả và gửi PaymentIntent.id vào query
//     router.push(
//       `http://prestige-home.de/thank-you?payment_intent=${paymentIntentId}`,
//       { locale },
//     );
//   };

//   /** ✅ Cleanup helper */
//   const handlePaymentFail = (message?: string) => {
//     toast.error(message || t("paymentFailed"));

//     // 🧹 Xóa userIdGuest nếu có
//     if (localStorage.getItem("userIdGuest")) {
//       localStorage.removeItem("userIdGuest");
//       localStorage.removeItem("access_token");
//     }

//     // 🔄 Reset form
//     form.reset();
//   };

//   // Reset clientSecret & PaymentRequest khi đổi phương thức
//   useEffect(() => {
//     setClientSecret(null);
//     setPaymentRequest(null);
//   }, [selectedMethod, setClientSecret]);

//   // PaymentRequest logic (Apple/Google Pay)
//   useEffect(() => {
//     if (!stripe || !clientSecret) return;

//     // Reset paymentRequest cũ
//     if (paymentRequest) {
//       paymentRequest.abort?.();
//       setPaymentRequest(null);
//     }

//     // Apple / Google Pay
//     /** ✅ Apple / Google Pay */
//     if (selectedMethod === "applepay" || selectedMethod === "googlepay") {
//       const pr = stripe.paymentRequest({
//         country: "DE",
//         currency: "eur",
//         total: { label: "Econelo Payment", amount: total ?? 0 },
//         requestPayerName: true,
//         requestPayerEmail: true,
//       });

//       const handlePaymentMethod = async (
//         ev: PaymentRequestPaymentMethodEvent,
//       ) => {
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
//           } else {
//             handlePaymentFail();
//           }
//         } catch (err) {
//           ev.complete("fail");
//           console.error(err);
//           handlePaymentFail(t("paymentFailed"));
//         }
//       };

//       pr.on("paymentmethod", handlePaymentMethod);

//       pr.canMakePayment().then((result) => {
//         if (result) {
//           setPaymentRequest(pr);
//           pr.show();
//         } else {
//           handlePaymentFail(t("browserNotSupport"));
//           setClientSecret(null);
//         }
//       });

//       pr.on("cancel", () => {
//         handlePaymentFail(t("paymentCancelled"));
//         setClientSecret(null);
//       });

//       return () => {
//         pr.off("paymentmethod", handlePaymentMethod);
//         pr.abort?.();
//       };
//     }

//     // Klarna
//     if (selectedMethod === "klarna") {
//       const confirmKlarna = async () => {
//         try {
//           const { error } = await stripe.confirmKlarnaPayment(clientSecret, {
//             payment_method: {
//               billing_details: {
//                 email: userEmail ?? "example@gmail.com",
//                 address: { country: "DE" },
//               },
//             },
//             return_url: `https://www.prestige-home.de/thank-you`,
//           });

//           if (error) {
//             // Nếu có lỗi ngay lập tức (VD: không đủ thông tin, không support Klarna)
//             handlePaymentFail(error.message || t("klarnaNotAllow"));
//             router.push("/check-out", { locale });
//           }
//         } catch (err) {
//           console.error(err);
//           handlePaymentFail(t("klarnaNotAllow"));
//           router.push("https://www.prestige-home.de/check-out", { locale });
//         }
//       };
//       confirmKlarna();
//     }
//   }, [stripe, clientSecret, selectedMethod, total]);

//   if (!stripe || !elements) return <Loader2 className="animate-spin" />;

//   /** ✅ Card Payment */
//   const handleCardPay = async () => {
//     if (!stripe || !elements || !clientSecret) return;
//     const card = elements.getElement(CardElement);
//     if (!card) return;

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
//       } else {
//         handlePaymentFail();
//       }
//     } catch (err) {
//       console.error(err);
//       handlePaymentFail(t("paymentFailed"));
//     }
//   };

//   return (
//     <Card className="mx-auto p-4 shadow-lg">
//       <CardHeader>
//         <div className="font-bold text-base">{t("selectPayment")}</div>
//       </CardHeader>

//       <CardContent className="space-y-4">
//         {/* UI chọn phương thức – luôn render được */}
//         <PaymentMethods
//           form={form}
//           t={t}
//         />

//         {/* Nếu chọn card + có clientSecret → mở dialog card */}
//         {selectedMethod === "card" && clientSecret && (
//           <Dialog
//             open={openDialog}
//             onOpenChange={setOpenDialog}
//           >
//             <DialogContent className="sm:max-w-md">
//               <DialogHeader>
//                 <DialogTitle>{t("enterCardDetails")}</DialogTitle>
//               </DialogHeader>

//               <div className="space-y-4">
//                 <div className="border rounded-md p-2">
//                   <CardElement options={{ hidePostalCode: true }} />
//                 </div>
//                 <Button
//                   type="button"
//                   className="w-full"
//                   onClick={handleCardPay}
//                 >
//                   {t("payWithCard")}
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// /* -------------------------------------------------------
//  * 3) StripeLayout – wrap Elements + export memo
//  * -----------------------------------------------------*/
// function StripeLayout(props: CheckoutFormProps) {
//   return (
//     <Elements stripe={stripePromise}>
//       <CheckoutForm {...props} />
//     </Elements>
//   );
// }

// export default React.memo(StripeLayout);

"use client";

import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutPaymentLogic, { CheckoutFormProps } from "./payment-logic";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

export default function StripeLayout(props: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutPaymentLogic {...props} />
    </Elements>
  );
}
