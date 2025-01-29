"use client";
import UserSignup from "@/components/test/UserSignup";

export default function SignupPage() {
    return (
        <div className="flex items-center justify-center h-screen">
            <UserSignup onProfileUpdate={() => (window.location.href = "/dashboard")} />
        </div>
    );
}
