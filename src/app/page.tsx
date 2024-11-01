"use client";
import dynamic from "next/dynamic";
import { AuthProvider, LoginButton, useAuth } from "@/components/Auth0";

// Dynamic imports for components
const WasmProvider = dynamic(() => import("@/components/WasmProvider"), {
  ssr: false,
  loading: () => <div>Loading WASM provider...</div>,
});

const Echo = dynamic(() => import("@/components/Echo"), {
  ssr: false,
  loading: () => <div>Loading Echo component...</div>,
});

const Auth0Config = dynamic(() => import("@/components/Auth0Config"), {
  ssr: false,
  loading: () => <div>Loading Auth0Config component...</div>,
});

const TokenExchange = dynamic(() => import("@/components/TokenExchange"), {
  ssr: false,
  loading: () => <div>Loading Token Exchange component...</div>,
});

const TokenClaims = dynamic(() => import("@/components/TokenClaims"), {
  ssr: false,
  loading: () => <div>Loading Token Claims component...</div>,
});

const AppVersion = dynamic(() => import("@/components/AppVersion"), {
  ssr: false,
  loading: () => <div>Loading App Version component...</div>,
});

// Protected content wrapper
const ProtectedContent = ({ children }) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Loading authentication status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl mb-4">Please login to access this content</h2>
        <LoginButton />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 p-4 bg-gray-50 rounded">
        <div>
          <p className="text-sm text-gray-600">Welcome, {user?.given_name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
};

export default function Home() {
  return (
    <WasmProvider>
      <AuthProvider>
        <main className="p-8 bg-white">
          <section className="mb-8">
            <h2 className="text-xl mb-4">App Version</h2>
            <AppVersion />
          </section>

          <section className="mb-8">
            <h2 className="text-xl mb-4">Authentication</h2>
            <div className="p-4 border rounded">
              <LoginButton />
            </div>
          </section>

          <ProtectedContent>
            <section className="mb-8">
              <h2 className="text-xl mb-4">Auth0 Config Test</h2>
              <Auth0Config />
            </section>

            <section className="mb-8">
              <h2 className="text-xl mb-4">Echo Test</h2>
              <Echo />
            </section>

            <section className="mb-8">
              <h2 className="text-xl mb-4">Token Exchange</h2>
              <TokenExchange />
            </section>

            <section className="mb-8">
              <h2 className="text-xl mb-4">Token Claims</h2>
              <TokenClaims />
            </section>
          </ProtectedContent>
        </main>
      </AuthProvider>
    </WasmProvider>
  );
}
