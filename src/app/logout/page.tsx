'use client'
import { Button } from "@/components/ui/button";
// import { useAuth } from "@/components/Auth0"
import Image from "next/image";
import { useRouter } from "next/navigation";
import Typography from "@/components/typography";
import { useAuth } from "@/hooks/auth-hook/Auth0Provider";

export default function LogoutScreen() {
  const { loginWithRedirect } = useAuth();
  const router = useRouter();

  return (
    <div className="flex justify-center h-full">
      <div className="text-center">
        <Typography className="mt-8 mb-16 justify-center" textSize="h2">You were logged out</Typography>
        <Image
          src={require("@/assets/undraw_close-tab_jr11.svg")}
          alt="Signed Out Illustration"
          width={400}
          height={400}
          className="mb-6"
        />
        <div className="flex justify-center mt-8 gap-4">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => loginWithRedirect()}
          >
            Login
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/documentation")}
          >
            View Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}