import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const priceId = process.env.STRIPE_REQUIREMENT_PRICE_ID;

export async function GET() {
    try {
        if (!stripe || !priceId) throw new Error("Stripe is not configured properly");

        const priceData = await stripe.prices.retrieve(priceId);

        if (!priceData.unit_amount) throw new Error("Invalid Stripe price data");

        return NextResponse.json({ price: priceData.unit_amount });
    } catch (err: unknown) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to fetch price" },
            { status: 500 }
        );
    }
}
