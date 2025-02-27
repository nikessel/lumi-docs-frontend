"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ReactNode } from 'react';
import { useAuth } from "./hooks/auth-hook/Auth0Provider";
import { Button } from "antd";
import { useUserContext } from "./contexts/user-context";

// Dynamic imports for components
const WasmProvider = dynamic(() => import("@/components/WasmProvider"), {
  ssr: false,
  loading: () => <div>Loading WASM provider...</div>,
});

const Echo = dynamic(() => import("@/components/test/Echo"), {
  ssr: false,
  loading: () => <div>Loading Echo component...</div>,
});

const Auth0Config = dynamic(() => import("@/components/test/Auth0Config"), {
  ssr: false,
  loading: () => <div>Loading Auth0Config component...</div>,
});

const TokenExchange = dynamic(() => import("@/components/test/TokenExchange"), {
  ssr: false,
  loading: () => <div>Loading Token Exchange component...</div>,
});

const TokenClaims = dynamic(() => import("@/components/test/TokenClaims"), {
  ssr: false,
  loading: () => <div>Loading Token Claims component...</div>,
});

const AppVersion = dynamic(() => import("@/components/test/AppVersion"), {
  ssr: false,
  loading: () => <div>Loading App Version component...</div>,
});

const UserSignup = dynamic(() => import("@/components/test/UserSignup"), {
  ssr: false,
  loading: () => <div>Loading User Signup component...</div>,
});

// Protected content wrapper
type ProtectedContentProps = {
  children: ReactNode;
};

const ProtectedContent = ({ children }: ProtectedContentProps) => {
  const { isAuthenticated, isLoading, logout, loginWithRedirect } = useAuth();
  const { user } = useUserContext()

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
        <Button onClick={loginWithRedirect} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 p-4 bg-gray-50 rounded">
        <div>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={() => logout()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
};

// Test component wrapper for consistent styling
type TestComponentProps = {
  title: string;
  children: ReactNode;
};

const TestComponent = ({ title, children }: TestComponentProps) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

export default function TestPage() {
  const { loginWithRedirect } = useAuth();


  const handleProfileUpdate = () => {
    // No parameters needed since UserSignupProps expects a function with no parameters
    console.log('Profile updated');
    // Handle profile update logic here
  };

  return (
    <WasmProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Test Components</h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>

          <div className="mb-8">
            <TestComponent title="App Version">
              <AppVersion />
            </TestComponent>
          </div>

          <div className="mb-8">
            <TestComponent title="Authentication">
              <div className="p-4 border rounded">
                <Button onClick={loginWithRedirect} />
              </div>
            </TestComponent>
          </div>

          <ProtectedContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestComponent title="User Signup">
                <UserSignup onProfileUpdate={handleProfileUpdate} />
              </TestComponent>

              <TestComponent title="Auth0 Config">
                <Auth0Config />
              </TestComponent>

              <TestComponent title="Echo Test">
                <Echo />
              </TestComponent>

              <TestComponent title="Token Exchange">
                <TokenExchange />
              </TestComponent>

              <TestComponent title="Token Claims">
                <TokenClaims />
              </TestComponent>
            </div>
          </ProtectedContent>
        </div>
      </div>
    </WasmProvider>
  );
}
