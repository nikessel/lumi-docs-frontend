"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/Auth0";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, Layout } from "antd";
import { antdconfig } from "@/../antd-config";
import AppSider from "@/components/sidebar";
import "@/styles/globals.css";
import LoadingLogoScreen from "@/components/loading-screen";
import WasmProviderComponent, { useWasm } from "@/components/WasmProvider";
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-filemanager/styles/material.css';
import '@caldwell619/react-kanban/dist/styles.css';
import { ReportsProvider } from "@/contexts/reports-context";
import { RegulatoryFrameworksProvider } from '@/contexts/regulatory-frameworks-context';
import { FilesProvider } from '@/contexts/files-context';
import { UserProvider } from "@/contexts/user-context";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from "@/components/Auth0";
import { useReportsContext } from "@/contexts/reports-context";
import { SearchParamsProvider } from "@/contexts/search-params-context";
import TourComponent from "@/components/user-guide-components/tour";
import { useUserContext } from "@/contexts/user-context";
import LoginPrompt from "@/components/login-prompt";
import { useRouter } from "next/navigation";
import { Alert } from "antd";
import UploadIndicator from "@/components/upload-files/upload-indicator";
import { SectionsProvider } from "@/contexts/sections-context";
import { RequirementGroupsProvider } from "@/contexts/requirement-group-context";
import { RequirementsProvider } from "@/contexts/requirements-context";
import { AllRequirementsProvider } from "@/contexts/requirements-context/all-requirements-context";
import { TasksProvider } from "@/contexts/tasks-context";
import { useRequirementGroupsContext } from "@/contexts/requirement-group-context";
import { useRequirementsContext } from "@/contexts/requirements-context";
import { useSectionsContext } from "@/contexts/sections-context";
import { useTasksContext } from "@/contexts/tasks-context";


const { Content } = Layout;

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) : null;

function LayoutWithWasm({ children }: { children: ReactNode }) {
  const [globalLoading, setGlobalLoading] = useState(true)
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false)
  const { isLoading: wasmLoading } = useWasm();
  const { isLoading: AuthLoading, isAuthenticated } = useAuth()

  const { loading: reportsLoading } = useReportsContext()
  const { user, loading: userLoading } = useUserContext()
  const { loading: groupsLoading } = useRequirementGroupsContext()
  const { loading: requirementsLoading } = useRequirementsContext()
  const { loading: sectionsLoading } = useSectionsContext()
  const { loading: tasksLoading } = useTasksContext()


  const router = useRouter()
  const routesWithoutAuth = useMemo(() => ["/verify-email", "/callback", "/documentation", "/signup", "/logout"], []);
  const routesWithoutLayout = useMemo(() => ["/documentation", "/logout", "/signup", "/verify-email", "/callback"], []);
  const adminRoutes = useMemo(() => ["/test"], []);

  const [showNoPaymentWarning, setShowNoPaymentWarning] = useState(false)

  const noLayout = typeof window !== "undefined" && (routesWithoutLayout.indexOf(window.location.pathname) > -1);

  const reportsRef = useRef(null);
  const regulatoryFrameworksRef = useRef(null);
  const filesRef = useRef(null)
  const tasksRef = useRef(null)
  const newReportButtonRef = useRef(null);

  useEffect(() => {
    if (!stripePromise) {
      setShowNoPaymentWarning(true)
    } else {
      setShowNoPaymentWarning(false)
    }
  }, [])

  useEffect(() => {
    if (!wasmLoading && !AuthLoading && !reportsLoading && !userLoading && window.location.pathname !== "/callback" && !initialLoadCompleted && !groupsLoading && !requirementsLoading && !sectionsLoading && !tasksLoading) {
      setGlobalLoading(false)
      setInitialLoadCompleted(true)
    }
  }, [wasmLoading, AuthLoading, reportsLoading, initialLoadCompleted, userLoading, groupsLoading, requirementsLoading, sectionsLoading, tasksLoading])

  useEffect(() => {
    if (adminRoutes.indexOf(window.location.pathname) && user && !user.config?.admin) {
      router.push("/dashboard")
    }
  }, [adminRoutes, router, user])

  if (globalLoading) {
    return <LoadingLogoScreen>{window.location.pathname === "/callback" ? children : ""}</LoadingLogoScreen>;
  }

  if (!globalLoading && !isAuthenticated && routesWithoutAuth.indexOf(window.location.pathname) < 0) {
    return <LoginPrompt />
  }


  return (
    <AntdRegistry>
      <Elements stripe={stripePromise}>
        <ConfigProvider theme={antdconfig}>
          {showNoPaymentWarning ? <Alert message="WARNING: PAYMENT API IS NOT ENABLED" type="warning" showIcon closable /> : ""}
          <Layout className="h-full" style={{ minWidth: 1200 }}>
            {!noLayout ? <AppSider reportsRef={reportsRef} regulatoryFrameworksRef={regulatoryFrameworksRef} filesRef={filesRef} tasksRef={tasksRef} /> : ""}
            <Layout className="h-full">
              <UploadIndicator />
              <TourComponent startTour={user?.preferences?.tour_enabled || false} reportsRef={reportsRef} regulatoryFrameworksRef={regulatoryFrameworksRef} filesRef={filesRef} newReportButtonRef={newReportButtonRef} />
              <Content className="pt-8 pb-8 px-4 sm:px-8 container h-full">
                <div className="bg-white p-6 rounded shadow-sm h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  {children}
                </div>
              </Content>
            </Layout>
          </Layout>
        </ConfigProvider>
      </Elements>
    </AntdRegistry >

  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <WasmProviderComponent>
          <Suspense fallback={<LoadingLogoScreen />}>
            <AuthProvider>
              <UserProvider>
                <SearchParamsProvider>
                  <AllRequirementsProvider>
                    <ReportsProvider>
                      <RegulatoryFrameworksProvider>
                        <SectionsProvider>
                          <RequirementGroupsProvider>
                            <RequirementsProvider>
                              <FilesProvider>
                                <TasksProvider>
                                  <LayoutWithWasm>{children}</LayoutWithWasm>
                                </TasksProvider>
                              </FilesProvider>
                            </RequirementsProvider>
                          </RequirementGroupsProvider>
                        </SectionsProvider>
                      </RegulatoryFrameworksProvider>
                    </ReportsProvider>
                  </AllRequirementsProvider>
                </SearchParamsProvider>
              </UserProvider>
            </AuthProvider>
          </Suspense>
        </WasmProviderComponent>
      </body>
    </html>
  );
}