'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useReportsContext } from '@/contexts/reports-context';
import { useSectionsContext } from '@/contexts/sections-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import Navigation from '@/components/test/navigation';
import MainContent from '@/components/test/main-content';
import ToolBar from '@/components/test/tool-bar';

const { Content } = Layout;

const Page = () => {
    const { filteredSelectedReports, loading: reportsLoading } = useReportsContext();
    const { filteredSelectedReportsSections, loading: sectionsLoading } = useSectionsContext();
    const { filteredSelectedRequirements, loading: requirementsLoading } = useRequirementsContext();
    const { filteredSelectedRequirementGroups, loading: groupsLoading } = useRequirementGroupsContext();
    const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());

    const isLoading = reportsLoading || sectionsLoading || requirementsLoading || groupsLoading;

<<<<<<< HEAD
=======
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

const DeviceList = dynamic(() => import("@/components/test/DeviceList"), {
  ssr: false,
  loading: () => <div>Loading DeviceList component...</div>,
});


interface ProtectedContentProps {
  children: ReactNode;
}

// Protected content wrapper
const ProtectedContent = ({ children }: ProtectedContentProps) => {
  const { isAuthenticated, isLoading, user, logout, login } = useAuth();

  if (isLoading) {
>>>>>>> main
    return (
        <div className="h-full">
            {/* Top Toolbar - Spans full width */}
            <div className="h-16 bg-white border-b px-4 flex items-center justify-between w-full">
                <ToolBar />
            </div>

            {/* Resizable Panels */}
            <div className="h-[calc(100vh-4rem)]">
                <PanelGroup direction="horizontal" className="h-full">
                    {/* Navigation Panel */}
                    <Panel defaultSize={20} minSize={15} maxSize={40} className="bg-white border-r">
                        <Navigation selectedSections={selectedSections} onSectionSelect={setSelectedSections} />
                    </Panel>

                    {/* Resize Handle */}
                    <PanelResizeHandle className="w-0.2 bg-gray-200 hover:bg-gray-300 transition-colors" />

                    {/* Main Content Panel */}
                    <Panel defaultSize={80} className="bg-white">
                        <MainContent selectedSections={selectedSections} />
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
};

<<<<<<< HEAD
export default Page;
=======
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

  // Callback to refresh the user profile after a successful signup
  const handleProfileUpdate = () => {
    setRefreshProfile((prev) => !prev); // Toggle to trigger re-fetch
  };

  return (
    <WasmProvider>
      <AuthProvider>
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
                <TestComponent title="Authentication">
                  <div className="p-4 border rounded">
                    <LoginButton />
                  </div>
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

                <TestComponent title="Device List">
                  <DeviceList />
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
      </AuthProvider>
    </WasmProvider>
  );
}
>>>>>>> main
