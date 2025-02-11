"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import type { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, Layout } from "antd";
import { antdconfig } from "@/../antd-config";
import AppSider from "@/components/sidebar";
import "@/styles/globals.css";
import LoadingLogoScreen from "@/components/loading-screen";
import WasmProviderComponent from "@/components/WasmProvider";
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-filemanager/styles/material.css';
import '@caldwell619/react-kanban/dist/styles.css';
import { ReportsProvider } from "@/contexts/reports-context";
import { RegulatoryFrameworksProvider } from '@/contexts/regulatory-frameworks-context';
import { FilesProvider } from '@/contexts/files-context';
import { UserProvider } from "@/contexts/user-context";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { SearchParamsProvider } from "@/contexts/search-params-context";
import TourComponent from "@/components/user-guide-components/tour";
import { Alert } from "antd";
import UploadIndicator from "@/components/upload-files/upload-indicator";
import { SectionsProvider } from "@/contexts/sections-context";
import { RequirementGroupsProvider } from "@/contexts/requirement-group-context";
import { RequirementsProvider } from "@/contexts/requirements-context";
import { AllRequirementsProvider } from "@/contexts/requirements-context/all-requirements-context";
import { TasksProvider } from "@/contexts/tasks-context";
import { AuthProvider, useAuth } from "@/hooks/auth-hook/Auth0Provider";
import { usePathname } from "next/navigation"
import { RequirementPriceProvider } from "@/contexts/price-context/use-requirement-price-context";
import LoginPrompt from "@/components/login-prompt";
import { useAllRequirementsContext } from "@/contexts/requirements-context/all-requirements-context";


const { Content } = Layout;

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) : null;

function LayoutWithWasm({ children }: { children: ReactNode }) {
  const { isLoading: authLoading, isAuthenticated } = useAuth()
  const { loading: requirementsLoading } = useAllRequirementsContext()
  const routesWithoutAuth = useMemo(() => ["/verify-email", "/callback", "/documentation", "/signup", "/logout", "login"], []);
  const routesWithoutLayout = useMemo(() => ["/documentation", "/logout", "/signup", "/verify-email", "/callback"], []);

  const [showNoPaymentWarning, setShowNoPaymentWarning] = useState(false)
  const pathname = usePathname();

  const noLayout = useMemo(() => {
    return routesWithoutLayout.includes(pathname);
  }, [pathname, routesWithoutLayout]);

  const reportsRef = useRef(null);
  const regulatoryFrameworksRef = useRef(null);
  const filesRef = useRef(null)
  const tasksRef = useRef(null)
  const newReportButtonRef = useRef(null);

  const { isCheckingSession } = useAuth();

  useEffect(() => {
    if (!stripePromise) {
      setShowNoPaymentWarning(true)
    } else {
      setShowNoPaymentWarning(false)
    }
  }, [])

  const [waitForAuth, setWaitForAuth] = useState(true);

  useEffect(() => {
    if (isCheckingSession || authLoading) {
      setWaitForAuth(true);
    } else {
      const timeout = setTimeout(() => {
        setWaitForAuth(false);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isCheckingSession, authLoading]);

  if ((waitForAuth) && routesWithoutAuth.indexOf(pathname) < 0) {
    return <LoadingLogoScreen />;
  }

  if (!isAuthenticated && !authLoading && routesWithoutAuth.indexOf(pathname) < 0) {
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
              <TourComponent startTour={false} reportsRef={reportsRef} regulatoryFrameworksRef={regulatoryFrameworksRef} filesRef={filesRef} newReportButtonRef={newReportButtonRef} />
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
          {/* <OldAuthProvider> */}
          <AuthProvider>
            <UserProvider>
              <AllRequirementsProvider>
                <SearchParamsProvider>
                  <ReportsProvider>
                    <RegulatoryFrameworksProvider>
                      <SectionsProvider>
                        <RequirementGroupsProvider>
                          <RequirementsProvider>
                            <RequirementPriceProvider>
                              <FilesProvider>
                                <TasksProvider>
                                  <LayoutWithWasm>{children}</LayoutWithWasm>
                                </TasksProvider>
                              </FilesProvider>
                            </RequirementPriceProvider>
                          </RequirementsProvider>
                        </RequirementGroupsProvider>
                      </SectionsProvider>
                    </RegulatoryFrameworksProvider>
                  </ReportsProvider>
                </SearchParamsProvider>
              </AllRequirementsProvider>
            </UserProvider>
          </AuthProvider>
          {/* </OldAuthProvider> */}
        </WasmProviderComponent>
      </body>
    </html>
  );
}