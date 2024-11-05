"use client";

import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AuthProvider, AuthContext } from "@/components/Auth0";

const WasmProvider = dynamic(() => import("@/components/WasmProvider"), {
  ssr: false,
  loading: () => <div>Loading WASM provider...</div>,
});

export default function LogoutPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("LogoutPage must be used within an AuthProvider");
  }

  const { logout, isLoading, isAuthenticated } = authContext;

  useEffect(() => {
    const handleLogout = async () => {
      if (isAuthenticated) {
        await logout();
      }
    };

    handleLogout();
  }, [logout, isAuthenticated]);

  return (
    <WasmProvider>
      <AuthProvider>
        <div className="flex flex-col items-center justify-center min-h-screen">
          {isLoading ? (
            <div>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Logging out...</p>
            </div>
          ) : (
            <>
              <p className="mb-4">You have been logged out.</p>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Home
              </button>
            </>
          )}
        </div>
      </AuthProvider>
    </WasmProvider>
  );
}
