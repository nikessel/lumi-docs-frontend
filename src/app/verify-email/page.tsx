"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Typography, Alert } from "antd";
import Image from "next/image";
import { useAuth } from "@/hooks/auth-hook/Auth0Provider";
import { useUserContext } from "@/contexts/user-context";

const { Title, Text } = Typography;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { loginWithRedirect, clearTokens, logout } = useAuth();
  const { user } = useUserContext()


  useEffect(() => {
    if (!email) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/auth/check-email?email=milsoe1992@gmail.com`);
        console.log("ADASDSDASD234234", response)

        if (!response.ok) throw new Error("Failed to check verification status");
        const data = await response.json();


        if (data.email_verified) {
          clearInterval(interval);
          console.log("✅ Email verified. Redirecting...");
          logout()
          clearTokens()
          loginWithRedirect();  // Automatically log in the user
        }
      } catch (error) {
        console.error("Error checking email verification:", error);
      }
    }, 2000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [email, loginWithRedirect, clearTokens]);

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

        <Text className="text-sm text-gray-500 mt-2">
          Didn&apos;t receive the email? Check your spam folder or please contact support at ms@lumi-docs.com
        </Text>
      </div>
    </div>
  );
}
