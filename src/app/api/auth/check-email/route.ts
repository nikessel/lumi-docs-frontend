import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
        console.log(`🔍 Checking email verification for: ${email}`);

        // 1️⃣ Get Auth0 Management API Token
        const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: process.env.AUTH0_CLIENT_ID,
                client_secret: process.env.AUTH0_CLIENT_SECRET,
                audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
                grant_type: "client_credentials",
            }),
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
            console.error("❌ Failed to get Auth0 token:", tokenData);
            return NextResponse.json({ error: "Failed to obtain Auth0 token", details: tokenData }, { status: 500 });
        }

        const { access_token } = tokenData;
        console.log("✅ Auth0 token obtained");

        // 2️⃣ Fetch User Info from Auth0
        const userResponse = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const userData = await userResponse.json();
        if (!userResponse.ok) {
            console.error("❌ Failed to fetch user from Auth0:", userData);
            return NextResponse.json({ error: "Failed to fetch user from Auth0", details: userData }, { status: 500 });
        }

        if (userData.length === 0) {
            console.warn("⚠️ User not found in Auth0");
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = userData[0];
        console.log(`🔍 User found: ${user.email} (Verified: ${user.email_verified})`);

        return NextResponse.json({ email_verified: user.email_verified });

    } catch (error) {
        console.error("🚨 Error in /api/auth/check-email:", error);
        return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
    }
}
