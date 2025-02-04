"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/Auth0";
import { useWasm } from "@/components/WasmProvider";
import { useStorage } from "@/storage";
import { Card, Typography, Spin, Button, Alert } from "antd";
import Image from "next/image";


const { Title, Text } = Typography;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { login } = useAuth();
  const { wasmModule } = useWasm();
  const [idToken] = useStorage("id_token");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!email) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error("Failed to check verification status");

        const data = await response.json();
        console.log("VERIFIEDDD", data);

        if (data.email_verified) {
          clearInterval(interval);
          setIsVerified(true);

          console.log("✅ Email verified. Redirecting...");
          login();  // Automatically log in the user
          setTimeout(() => router.push("/dashboard"), 2000); // Redirect after login
        }
      } catch (error) {
        console.error("Error checking email verification:", error);
      }
    }, 2000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [email, login, router]);

  return (
    <div className="flex items-center justify-center py-12 px-4 ">
      <div className=" text-center">
        <Title className="mt-4" level={3}>Please Verify Your Email</Title>
        <Text className="mr-2 mt-4">We sent a verification email to:</Text>
        <Text strong>{email || "your email address"}</Text>
        <div className="mt-4">
          <Alert showIcon message="You will automatically be redirected after verifying your email" />
        </div>
        <div className="flex justify-center my-8">
          <Image
            src={require("@/assets/undraw_mail-sent_ujev.svg")}
            alt="Signed Out Illustration"
            width={300}
            height={300}
            className="mb-6"
          />
        </div>
        {/* <div className="mt-4">
          {isVerified === null ? (
            <Spin size="large" />
          ) : isVerified ? (
            <Text type="success">✅ Email Verified! Redirecting...</Text>
          ) : (
            <Text type="warning">
              Please check your email and click the verification link. After verifying:
            </Text>
          )}
        </div> */}

        <Text className="text-sm text-gray-500 mt-2">
          Didn&apos;t receive the email? Check your spam folder or please contact support at ms@lumi-docs.com
        </Text>
      </div>
    </div>
  );
}


// "use client";
// import { useEffect, useState } from "react"
// import { useSearchParams } from "next/navigation";
// import { useAuth } from "@/components/Auth0";
// import { useWasm } from "@/components/WasmProvider";
// import { useStorage } from "@/storage";
// import type { StorageKey, Claims } from "@wasm";
// import { storage } from "@/storage";

// const SK = {
//   id_token: "id_token" as StorageKey,
//   access_token: "access_token" as StorageKey,
// } as const;

// export default function VerifyEmailPage() {
//   const searchParams = useSearchParams();
//   const email = searchParams.get("email");
//   const { login } = useAuth();
//   const { wasmModule } = useWasm()
//   const [idToken] = useStorage(SK.id_token);
//   const [isVerified, setIsVerified] = useState<boolean | null>(null);


//   useEffect(() => {
//     if (!email) return;

//     const interval = setInterval(async () => {
//       try {
//         const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
//         if (!response.ok) throw new Error("Failed to check verification status");

//         const data = await response.json();
//         console.log("VERIFIEDDD", data);
//         if (data.email_verified) {
//           clearInterval(interval);
//           setIsVerified(true);

//           console.log("✅ Email verified. Refreshing tokens...");
//           login();  // 👈 Proceed with login
//         }
//       } catch (error) {
//         console.error("Error checking email verification:", error);
//       }
//     }, 5000); // Poll every 5 seconds

//     return () => clearInterval(interval);
//   }, [email, login]);


//   return (
//     <div className=" flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Please Verify Your Email
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             We sent a verification email to{" "}
//             <span className="font-medium text-blue-600">
//               {email || "your email address"}
//             </span>
//           </p>
//         </div>
//         <div className="rounded-md bg-yellow-50 p-4">
//           <div className="flex">
//             <div className="ml-3">
//               <h3 className="text-sm font-medium text-yellow-800">
//                 Verification Required
//               </h3>
//               <div className="mt-2 text-sm text-yellow-700">
//                 <p>
//                   Please check your email and click the verification link. After
//                   verifying:
//                 </p>
//                 <ul className="list-disc list-inside mt-2">
//                   <li>Return to this page and click &quot;Try Again&quot;</li>
//                   <li>Or refresh this page</li>
//                   <li>Or return to the home page and log in again</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="space-y-4">
//           <button
//             onClick={() => login()}
//             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//           >
//             Try Again
//           </button>
//           <div className="text-center">
//             <p className="text-sm text-gray-500">
//               Didn&apos;t receive the email? Check your spam folder or contact
//               support.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }