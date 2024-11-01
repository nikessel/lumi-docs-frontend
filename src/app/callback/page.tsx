"use client";
import dynamic from "next/dynamic";
import { AuthCallback, AuthProvider } from "@/components/Auth0";

const WasmProvider = dynamic(() => import("@/components/WasmProvider"), {
  ssr: false,
  loading: () => <div>Loading WASM provider...</div>,
});

export default function CallbackPage() {
  return (
    <WasmProvider>
      <AuthProvider>
        <div className="min-h-screen flex items-center justify-center">
          <AuthCallback />
        </div>
      </AuthProvider>
    </WasmProvider>
  );
}
