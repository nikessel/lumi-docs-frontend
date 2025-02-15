"use client";
import { useState, useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileSelector } from "@/components/test/FileSelector";
import { ReportCreator } from "@/components/test/ReportCreator";
import { ReportList } from "@/components/test/ReportList";
import { FileList } from "@/components/test/FileList";
import { useAuth } from "@/hooks/auth-hook/Auth0Provider";
import { useUserContext } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useWasm } from "@/components/WasmProvider";

// Dynamic imports for components
const WasmProvider = dynamic(() => import("@/components/WasmProvider"), {
  ssr: false,
  loading: () => <div>Loading WASM provider...</div>,
});

const Echo = dynamic(() => import("@/components/test/Echo"), {
  ssr: false,
  loading: () => <div>Loading Echo component...</div>,
});

const AdminUploadReport = dynamic(() => import("@/components/test/AdminUploadReport"), {
  ssr: false,
  loading: () => <div>Loading Report Uploader component...</div>,
});

const FetchTasks = dynamic(() => import("@/components/test/FetchTasks"), {
  ssr: false,
  loading: () => <div>Loading Fetch Tasks component...</div>,
});


const UpdateUserPreferences = dynamic(() => import("@/components/test/UpdateUserPreferences"), {
  ssr: false,
  loading: () => <div>Loading Update User Preferences component...</div>,
});

const UpdateTaskMisc = dynamic(() => import("@/components/test/UpdateTaskMisc"), {
  ssr: false,
  loading: () => <div>Loading Update Task Misc component...</div>,
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

const UserProfile = dynamic(() => import("@/components/test/UserProfile"), {
  ssr: false,
  loading: () => <div>Loading User Profile component...</div>,
});

interface ProtectedContentProps {
  children: ReactNode;
}

// Protected content wrapper
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


  return (
    <div>
      <div className="flex justify-between items-center ">
        <div>
          {/* <p className="text-sm text-gray-600">Welcome, {user?.given_name}</p> */}
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
        <div className="text-center p-8">
          <h2 className="text-xl mb-4">Test re-login</h2>
          <Button onClick={loginWithRedirect}>LOGIN AGAIN</Button>
        </div>
      </div>
      {children}
    </div>
  );
};

interface TestComponentProps {
  title: string;
  children: ReactNode;
}

// Test component wrapper for consistent styling
const TestComponent = ({ title, children }: TestComponentProps) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

export default function TestPage() {
  const [refreshProfile, setRefreshProfile] = useState(false);
  const { user } = useUserContext()

  const router = useRouter()
  const { wasmModule } = useWasm()

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email && wasmModule) {
        const res = await wasmModule?.is_admin();
        console.log("reasdasdasdasda", res)
        if (!res?.output?.output) {
          router.push("/dashboard");
        }
      }
    };
    checkAdmin();
  }, [user, router, wasmModule]);

  // Callback to refresh the user profile after a successful signup
  const handleProfileUpdate = () => {
    setRefreshProfile((prev) => !prev); // Toggle to trigger re-fetch
  };

  return (
    <WasmProvider>
      <div className="">
        <div className="">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Test Components</h1>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          {/* Unauthenticated Section */}
          <h2 className="text-2xl font-semibold mb-6">
            Unauthenticated Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="mb-8">
              <TestComponent title="App Version">
                <AppVersion />
              </TestComponent>
            </div>

            <div className="mb-8">
              <TestComponent title="Auth0 Config">
                <Auth0Config />
              </TestComponent>
            </div>

            <div className="mb-8">
              <TestComponent title="Echo Test">
                <Echo />
              </TestComponent>
            </div>
          </div>

          {/* Authenticated Section */}
          <h2 className="text-2xl font-semibold mb-6">
            Authenticated Components
          </h2>
          <ProtectedContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestComponent title="User Signup">
                <UserSignup onProfileUpdate={handleProfileUpdate} />
              </TestComponent>

              <TestComponent title="User Profile">
                <UserProfile refreshProfile={refreshProfile} />
              </TestComponent>

              <TestComponent title="Token Exchange">
                <TokenExchange />
              </TestComponent>

              <TestComponent title="Token Claims">
                <TokenClaims />
              </TestComponent>

              <TestComponent title="File Upload">
                <FileSelector />
              </TestComponent>

              <TestComponent title="Create Report">
                <ReportCreator />
              </TestComponent>

              <TestComponent title="Reports">
                <ReportList />
              </TestComponent>

              <TestComponent title="Files">
                <FileList />
              </TestComponent>

              <TestComponent title="Admin Report Upload">
                <AdminUploadReport />
              </TestComponent>

              <TestComponent title="Update User Preferences">
                <UpdateUserPreferences />
              </TestComponent>

              <TestComponent title="Fetch Tasks">
                <FetchTasks />
              </TestComponent>

              <TestComponent title="Update Task Misc Field">
                <UpdateTaskMisc />
              </TestComponent>

            </div>
          </ProtectedContent>
        </div>
      </div>
    </WasmProvider>
  );
}
