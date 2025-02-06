"use client";

import React, { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
} from "@stripe/react-stripe-js";

console.log("process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

interface EmbeddedPaymentFormProps {
    quantity: number;
}

console.log("stripePromise", stripePromise)

const EmbeddedPaymentForm: React.FC<EmbeddedPaymentFormProps> = ({ quantity }) => {
    const fetchClientSecret = useCallback(() => {
        return fetch("/api/checkout_sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ quantity }),
        })
            .then((res) => res.json())
            .then((data) => data.clientSecret);
    }, [quantity]);

    const options = {
        fetchClientSecret,
    };

    return (
        <div id="checkout">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    );
};

export default EmbeddedPaymentForm;
