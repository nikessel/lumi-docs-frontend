"use client";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/Auth0";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Please Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a verification email to{" "}
            <span className="font-medium text-blue-600">
              {email || "your email address"}
            </span>
          </p>
        </div>
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Verification Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Please check your email and click the verification link. After
                  verifying:
                </p>
                <ul className="list-disc list-inside mt-2">
                  <li>Return to this page and click &quot;Try Again&quot;</li>
                  <li>Or refresh this page</li>
                  <li>Or return to the home page and log in again</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => login()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or contact
              support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
