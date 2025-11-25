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
