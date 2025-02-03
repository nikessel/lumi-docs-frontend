import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(req: Request) {
    console.log("STRIPEPOST!!!!!")
    try {
        if (!stripe) throw new Error("Stripe is not configured");

        const { quantity } = await req.json(); // Extract quantity from the request body

        const session = await stripe.checkout.sessions.create({
            ui_mode: "embedded",
            line_items: [
                {
                    price: "price_1QkjTCKts1QMyI6uN3FQtHwl", // Replace with your Price ID  
                    quantity, // Use the quantity passed from the frontend
                },
            ],
            mode: "payment",
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/reports?session_id={CHECKOUT_SESSION_ID}`,
            automatic_tax: { enabled: true },

        });

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: err.statusCode || 500 }
        );
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    try {
        if (!sessionId) {
            throw new Error("Session ID is required");
        }
        if (!stripe) throw new Error("Stripe is not configured");

        // Retrieve the Checkout Session details from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["line_items"],
        });

        return NextResponse.json({
            payment_status: session.payment_status,
            created: session.created,
            amount_total: session.amount_total, // Total amount paid in cents
            currency: session.currency, // Currency (e.g., USD)
            line_items: session.line_items?.data, // Purchased items
            customer_email: session.customer_details?.email, // Customer's email
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: error.statusCode || 500 }
        );
    }
}
