// import React, { useState } from 'react';
// import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
// import { StripeCardElement } from '@stripe/stripe-js'; // Import the correct type here

// const CheckoutForm = () => {
//     const stripe = useStripe();
//     const elements = useElements();
//     const [paymentStatus, setPaymentStatus] = useState<string | null>(null);


//     console.log("stripe", stripe)
//     const handleSubmit = async (event: React.FormEvent) => {
//         event.preventDefault();

//         if (!stripe || !elements) {
//             setPaymentStatus('Stripe has not loaded yet.');
//             return;
//         }

//         // Retrieve the card element with proper typing
//         const cardElement = elements.getElement(CardElement) as StripeCardElement | null;
//         if (!cardElement) {
//             setPaymentStatus('Card element not found!');
//             return;
//         }

//         // Mock API call to "create a payment intent"
//         const clientSecret = 'mock_client_secret'; // Normally fetched from the backend

//         // Confirm the payment
//         const result = await stripe.confirmCardPayment(clientSecret, {
//             payment_method: {
//                 card: cardElement,
//             },
//         });

//         if (result.error) {
//             setPaymentStatus('Payment failed: ' + result.error.message);
//         } else if (result.paymentIntent?.status === 'succeeded') {
//             setPaymentStatus('Payment successful!');
//             // Mock backend action
//             console.log('Fake backend: Payment succeeded!');
//         }
//     };

//     return (
//         <div>
//             <form onSubmit={handleSubmit}>
//                 <CardElement />
//                 <button type="submit" disabled={!stripe}>
//                     Pay
//                 </button>
//             </form>
//             {paymentStatus && <p>{paymentStatus}</p>}
//         </div>
//     );
// };

// export default CheckoutForm;
