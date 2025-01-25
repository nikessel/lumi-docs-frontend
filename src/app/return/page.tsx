"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ReturnPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [currency, setCurrency] = useState<string | null>(null);
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [customerEmail, setCustomerEmail] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        // Fetch session details from the backend
        fetch(`/api/checkout_sessions?session_id=${sessionId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    console.error("Error fetching session details:", data.error);
                    return;
                }
                setPaymentStatus(data.payment_status);
                setAmount(data.amount_total / 100);
                setCurrency(data.currency.toUpperCase());
                setLineItems(data.line_items || []);
                setCustomerEmail(data.customer_email);
            });
    }, [sessionId]);

    if (!sessionId) {
        return <p>No session ID found in the query string.</p>;
    }

    return (
        <section id="return">
            {paymentStatus === "paid" ? (
                <div>
                    <h1>Thank you for your purchase!</h1>
                    <p>
                        We are preparing your customized report. A confirmation email has
                        been sent to {customerEmail}.
                    </p>
                    <h2>Order Summary:</h2>
                    <ul>
                        {lineItems.map((item: any) => (
                            <li key={item.id}>
                                {item.description}: {item.quantity} x {item.amount_total / 100}{" "}
                                {currency}
                            </li>
                        ))}
                    </ul>
                    <p>
                        Total: {amount} {currency}
                    </p>
                </div>
            ) : (
                <p>Payment status: {paymentStatus}</p>
            )}
        </section>
    );
}


// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function ReturnPage() {
//     const [status, setStatus] = useState<string | null>(null);
//     const [customerEmail, setCustomerEmail] = useState<string>("");
//     const router = useRouter();

//     useEffect(() => {
//         const queryString = window.location.search;
//         const urlParams = new URLSearchParams(queryString);
//         const sessionId = urlParams.get("session_id");

//         if (sessionId) {
//             fetch(`/api/checkout_sessions?session_id=${sessionId}`, {
//                 method: "GET",
//             })
//                 .then((res) => res.json())
//                 .then((data) => {
//                     setStatus(data.status);
//                     setCustomerEmail(data.customer_email);
//                 });
//         }
//     }, []);

//     if (status === "open") {
//         router.push("/");
//         return null;
//     }

//     if (status === "complete") {
//         return (
//             <section id="success">
//                 <p>
//                     We appreciate your business! A confirmation email will be sent to{" "}
//                     {customerEmail}.
//                 </p>
//                 <p>
//                     If you have any questions, please email{" "}
//                     <a href="mailto:orders@example.com">orders@example.com</a>.
//                 </p>
//             </section>
//         );
//     }

//     return null;
// }
