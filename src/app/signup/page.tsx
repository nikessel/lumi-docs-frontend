"use client";
import UserSignup from "@/components/sign-up";

export default function SignupPage() {
    return (
        <div className="flex items-center justify-center ">
            <UserSignup onProfileUpdate={() => (window.location.href = "/dashboard")} />
        </div>
    );
}
