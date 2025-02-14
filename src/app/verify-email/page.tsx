"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Typography, Alert, Button } from "antd";
import Image from "next/image";
import { useAuth } from "@/hooks/auth-hook/Auth0Provider";
import { useRouter } from "next/navigation";
import { clear } from "console";
const { Title, Text } = Typography;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { loginWithRedirect, clearTokens, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();

  useEffect(() => {
    clearTokens()
  }, [])

  const handleLoginAgain = () => {
    router.push('/login');
    //loginWithRedirect()
  };


  return (
    <div className="flex items-center justify-center py-12 px-4 ">
      <div className="">
        <div className="text-center">
          <Title className="mt-4" level={3}>Please Verify Your Email</Title>
          <Text className="mr-2 mt-4">We sent a verification email to:</Text>
          <Text strong>{email || "your email address"}</Text>
        </div>
        <div className="mt-4">
          <Alert
            showIcon
            message="To sign in again and complete the signup you can either:"
            description={
              <ul className="list-disc">
                <li >Follow the link in the email</li>
                <li>Or click the button below once your email is verified</li>
              </ul>
            }
          />
        </div>
        <div className="flex items-center justify-center my-4">
          <Button loading={isLoading} type="primary" onClick={handleLoginAgain}>My email is verified</Button>
        </div>
        <div className="flex justify-center my-8">
          <Image
            src={require("@/assets/undraw_mail-sent_ujev.svg")}
            alt="Signed Out Illustration"
            width={200}
            height={200}
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
