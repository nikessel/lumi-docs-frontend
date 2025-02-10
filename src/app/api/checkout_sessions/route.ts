import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const price = process.env.STRIPE_REQUIREMENT_PRICE_ID


export async function POST(req: Request) {
    try {
        if (!stripe) throw new Error("Stripe is not configured");

        const { quantity } = await req.json();

        const session = await stripe.checkout.sessions.create({
            ui_mode: "embedded",
            line_items: [
                {
                    price: price,
                    quantity,
                },
            ],
            mode: "payment",
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/reports?session_id={CHECKOUT_SESSION_ID}`,
            automatic_tax: { enabled: true },

        });

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (err: unknown) {
        let errorMessage = "An unknown error occurred";
        let statusCode = 500;

        if (err instanceof Error) {
            errorMessage = err.message;
        }

        if (typeof err === "object" && err !== null && "statusCode" in err) {
            statusCode = (err as { statusCode: number }).statusCode;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
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
    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";
        let statusCode = 500;

        if (error instanceof Error) {
            errorMessage = error.message;
        }

        if (typeof error === "object" && error !== null && "statusCode" in error) {
            statusCode = (error as { statusCode: number }).statusCode;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }

}
