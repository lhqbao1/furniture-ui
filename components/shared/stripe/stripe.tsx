import React, { useState } from "react";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
    PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import {
    loadStripe,
    PaymentRequest,
    PaymentIntent,
} from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe("pk_test_xxx"); // Public key

type PaymentMethod = "card" | "applepay" | "googlepay" | "klarna" | null;

function Stripe() {
    const stripe = useStripe();
    const elements = useElements();

    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [method, setMethod] = useState<PaymentMethod>(null);
    const [paymentRequest, setPaymentRequest] =
        useState<PaymentRequest | null>(null);

    if (!stripe || !elements) {
        return <div>Loading...</div>;
    }

    const createPaymentIntent = async (selectedMethod: PaymentMethod) => {
        if (!selectedMethod) return;
        setMethod(selectedMethod);

        try {
            const res = await fetch(`/ api / create - payment - intent ? method = ${selectedMethod} `, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: 5000, currency: "eur" }),
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.status} `);
            }

            const data: { clientSecret: string } = await res.json();
            setClientSecret(data.clientSecret);

            if (selectedMethod === "applepay" || selectedMethod === "googlepay") {
                const pr = stripe.paymentRequest({
                    country: "DE",
                    currency: "eur",
                    total: { label: "Demo Payment", amount: 5000 },
                    requestPayerName: true,
                    requestPayerEmail: true,
                });

                const result = await pr.canMakePayment();
                if (result) {
                    setPaymentRequest(pr);
                } else {
                    alert("Apple Pay / Google Pay không khả dụng trên thiết bị này.");
                }
            }
        } catch (err) {
            console.error(err);
            alert("Không thể tạo Payment Intent.");
        }
    };

    const handleCardPay = async () => {
        if (!stripe || !elements || !clientSecret) return;

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            alert("Card element không tồn tại.");
            return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: { card: cardElement } }
        );

        if (error) {
            alert("❌ " + error.message);
        } else if (paymentIntent) {
            alert("✅ Payment success: " + paymentIntent.id);
        }
    };

    const handleKlarnaPay = async () => {
        if (!stripe || !clientSecret) return;

        const { error } = await stripe.confirmKlarnaPayment(clientSecret, {
            // payment_method: { billing_details: { email: "customer@example.com" } },
            return_url: "https://your-site.com/order/complete",
        });

        if (error) {
            alert("❌ " + error.message);
        }
    };

    return (
        <div>
            <h2>Checkout Demo</h2>

            <Button type="button" onClick={() => createPaymentIntent("card")}>Pay with Card</Button>
            <Button type="button" onClick={() => createPaymentIntent("applepay")}>Apple Pay</Button>
            <Button type="button" onClick={() => createPaymentIntent("googlepay")}>Google Pay</Button>
            <Button type="button" onClick={() => createPaymentIntent("klarna")}>Klarna</Button>

            {method === "card" && clientSecret && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Enter Card Details</h3>
                    <CardElement options={{ hidePostalCode: true }} />
                    <button onClick={handleCardPay}>Submit Card Payment</button>
                </div>
            )}

            {method === "applepay" && paymentRequest && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Apple Pay</h3>
                    <PaymentRequestButtonElement options={{ paymentRequest }} />
                </div>
            )}

            {method === "googlepay" && paymentRequest && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Google Pay</h3>
                    <PaymentRequestButtonElement options={{ paymentRequest }} />
                </div>
            )}

            {method === "klarna" && clientSecret && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Klarna Checkout</h3>
                    <button onClick={handleKlarnaPay}>Proceed with Klarna</button>
                </div>
            )}
        </div>
    );
}

export default function StripeLayout() {
    return (
        <Elements stripe={stripePromise}>
            <Stripe />
        </Elements>
    );
}
