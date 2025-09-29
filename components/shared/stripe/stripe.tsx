"use client";

import React, { useEffect, useState } from "react";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
    PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import { loadStripe, PaymentRequest, PaymentRequestPaymentMethodEvent } from "@stripe/stripe-js";

import { useFormContext } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import Image from "next/image";
import { paymentOptions } from "@/data/data";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

export type PaymentMethod = "card" | "applepay" | "googlepay" | "klarna";

interface CheckoutFormProps {
    clientSecret: string | null;
    setClientSecret: React.Dispatch<React.SetStateAction<string | null>>;
    total?: number;
    setTotal?: React.Dispatch<React.SetStateAction<number>>;
}

function CheckoutForm({ clientSecret, setClientSecret, total }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { control, watch } = useFormContext();
    const selectedMethod = watch("payment_method");
    const t = useTranslations();
    const router = useRouter();

    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

    const handlePaymentSuccess = (paymentIntentId: string) => {
        // Redirect sang trang kết quả và gửi PaymentIntent.id vào query
        router.push(`http://prestige-home.de/payment-result?paymentIntentId=${paymentIntentId}`);
    };

    // Reset clientSecret & PaymentRequest khi đổi phương thức
    useEffect(() => {
        setClientSecret(null);
        setPaymentRequest(null);
    }, [selectedMethod, setClientSecret]);

    // PaymentRequest logic (Apple/Google Pay)
    useEffect(() => {
        if (!stripe || !clientSecret) return;

        // Reset paymentRequest cũ
        if (paymentRequest) {
            paymentRequest.abort?.();
            setPaymentRequest(null);
        }

        // Apple / Google Pay
        if (selectedMethod === "applepay" || selectedMethod === "googlepay") {
            const pr = stripe.paymentRequest({
                country: "DE",
                currency: "eur",
                total: { label: "Demo Payment", amount: total ?? 0 },
                requestPayerName: true,
                requestPayerEmail: true,
            });

            const handlePaymentMethod = async (ev: PaymentRequestPaymentMethodEvent) => {
                try {
                    const { error, paymentIntent } = await stripe.confirmCardPayment(
                        clientSecret,
                        { payment_method: ev.paymentMethod.id },
                        { handleActions: false }
                    );
                    if (error) {
                        ev.complete("fail");
                        toast.error(error.message || t("paymentFailed"));
                        return;
                    }
                    ev.complete("success");
                    if (paymentIntent?.status === "requires_action") {
                        await stripe.confirmCardPayment(clientSecret);
                    }
                    if (paymentIntent?.status === "succeeded") handlePaymentSuccess(paymentIntent.id);
                } catch (err) {
                    ev.complete("fail");
                    console.error(err);
                }
            };

            pr.on("paymentmethod", handlePaymentMethod);

            pr.canMakePayment().then((result) => {
                if (result) {
                    setPaymentRequest(pr);
                    pr.show();
                } else {
                    toast.error(t("browserNotSupport"));
                    setClientSecret(null);
                }
            });

            pr.on("cancel", () => setClientSecret(null));

            return () => {
                pr.off("paymentmethod", handlePaymentMethod);
                pr.abort?.();
            };
        }

        // Klarna
        if (selectedMethod === "klarna") {
            const confirmKlarna = async () => {
                try {
                    const { error } = await stripe.confirmKlarnaPayment(clientSecret, {
                        payment_method: { billing_details: { email: "customer@example.com", address: { country: "DE" } } },
                        return_url: `http://prestige-home.de/payment-result?paymentIntentId=${clientSecret}`,
                    });
                    if (error) {
                        toast.error(error.message || t("klarnaNotAllow"));
                    }
                } catch (err) {
                    console.error(err);
                    toast.error(t("klarnaNotAllow"));
                }
            };
            confirmKlarna();
        }
    }, [stripe, clientSecret, selectedMethod, total]);

    if (!stripe || !elements) return <p>Loading Stripe...</p>;

    const handleCardPay = async () => {
        if (!stripe || !elements || !clientSecret) return;
        const card = elements.getElement(CardElement);
        if (!card) return;

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card },
        });

        if (error) {
            toast.error(error.message || t("paymentFailed"));
            return;
        }

        if (paymentIntent?.status === "succeeded") {
            handlePaymentSuccess(paymentIntent.id);
        }
    };

    const handleKlarnaPay = async () => {
        if (!stripe || !clientSecret) return;

        try {
            const { error } = await stripe.confirmKlarnaPayment(clientSecret, {
                payment_method: {
                    billing_details: { email: "customer@example.com", address: { country: "DE" } },
                },
                return_url: `http://prestige-home.de/payment-result?clientSecret=${clientSecret}`,
            });

            if (error) {
                if (error.code === "not_supported") {
                    toast.error(t("browserNotSupport"));
                } else {
                    toast.error(error.message || t("klarnaNotAllow"));

                }
                return;
            }
        } catch (err) {
            console.error(err);
            toast.error(t("klarnaNotAllow"));
        }
    };


    return (
        <Card className="mx-auto p-4 shadow-lg">
            <CardHeader>
                <div className="font-bold text-base">{t("selectPayment")}</div>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={control}
                    name="payment_method"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup
                                    className="grid grid-cols-1 gap-y-3"
                                    value={field.value}
                                    onValueChange={(val) => field.onChange(val)}
                                >
                                    {paymentOptions.map((option) => (
                                        <FormItem key={option.id} className="flex items-center gap-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value={option.id} id={option.id} />
                                            </FormControl>
                                            <FormLabel htmlFor={option.id} className="flex items-center gap-2 cursor-pointer">
                                                {option.logo && (
                                                    <Image src={option.logo} width={30} height={30} alt={option.label} unoptimized />
                                                )}
                                                <span>{option.label}</span>
                                            </FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {selectedMethod === "card" && clientSecret && (
                    <div className="space-y-2">
                        <p className="font-medium">Enter Card Details</p>
                        <div className="border rounded-md p-2">
                            <CardElement options={{ hidePostalCode: true }} />
                        </div>
                        <Button className="w-full" onClick={handleCardPay}>
                            Pay with Card
                        </Button>
                    </div>
                )}

                {/* {selectedMethod === "klarna" && clientSecret && (
                    <div className="space-y-2">
                        <p className="font-medium">Klarna Checkout</p>
                        <Button className="w-full" onClick={handleKlarnaPay}>
                            Proceed with Klarna
                        </Button>
                    </div>
                )} */}
            </CardContent>
        </Card>
    );
}

export default function StripeLayout(props: CheckoutFormProps) {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm {...props} />
        </Elements>
    );
}
