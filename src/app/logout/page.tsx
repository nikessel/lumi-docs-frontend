'use client'
import { Button } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Typography from "@/components/common/typography";
import { useAuth } from "@/hooks/auth-hook/Auth0Provider";

export default function LogoutScreen() {
  const { loginWithRedirect, signup } = useAuth();
  const router = useRouter();

  return (
    <div className="flex justify-center h-full">
      <div className="text-center">
        <Typography className="mt-8 mb-16 justify-center" textSize="h2">You were logged out</Typography>
        <Image
          src={require("@/assets/svgs/undraw_close-tab_jr11.svg")}
          alt="Signed Out Illustration"
          width={400}
          height={400}
          className="mb-6"
        />
        <div>
          <div className="flex justify-center mt-8 gap-4">
            <Button
              type="primary"
              onClick={() => loginWithRedirect()}
            >
              Login
            </Button>
            <Button
              type="default"
              onClick={() => signup()}
            >
              Sign Up
            </Button>
          </div>
          <Button
            className="mt-4"
            type="link"
            onClick={() => router.push("/documentation")}
          >
            View Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}