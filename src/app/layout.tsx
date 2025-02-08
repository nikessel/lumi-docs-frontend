"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef, Suspense } from "react";
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
import { AllReportsProvider } from "@/contexts/reports-context/all-reports-context";
import { RegulatoryFrameworksProvider } from '@/contexts/regulatory-frameworks-context';
import { FilesProvider } from '@/contexts/files-context';
import { UserProvider } from "@/contexts/user-context";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from "@/components/Auth0";
import useLoadingStore from "@/stores/global-loading-unification";
import { useAllReports } from "@/hooks/report-hooks";
import { SearchParamsProvider } from "@/contexts/search-params-context";
import { FilteredRequirementsProvider } from "@/contexts/requirement-context/filtered-report-requirement-context";
import { useSelectedFilteredReportsContext } from "@/contexts/reports-context/selected-filtered-reports";
import { SelectedFilteredReportsProvider } from "@/contexts/reports-context/selected-filtered-reports";
import TourComponent from "@/components/user-guide-components/tour";
import { useUserContext } from "@/contexts/user-context";
import LoginPrompt from "@/components/login-prompt";
import { useRouter } from "next/navigation";
import { Alert } from "antd";
import UploadIndicator from "@/components/upload-files/upload-indicator";

const { Content } = Layout;

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) : null;

function LayoutWithWasm({ children }: { children: ReactNode }) {
  const [globalLoading, setGlobalLoading] = useState(true)
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false)
  const { isLoading: wasmLoading } = useWasm(); // Now inside the provider context
  const { isLoading: AuthLoading, login, isAuthenticated } = useAuth()
  const { loading: reportsLoading } = useAllReports()
  const loadingComponents = useLoadingStore((state) => state.loadingComponents)
  const { reports } = useSelectedFilteredReportsContext()
  const { user, loading: userLoading, error: userError } = useUserContext()
  // const [enableTour, setEnableTour] = useState(false)
  // const [initialTourStarted, setInitialTourStarted] = useState(false)
  const router = useRouter()
  const routesWithoutAuth = ["/verify-email", "/callback", "/documentation", "/signup", "/logout"]
  const routesWithoutLayout = ["/documentation", "/logout", "/signup", "/verify-email", "/callback"]
  const adminRoutes = ["/test"]

  const [showNoPaymentWarning, setShowNoPaymentWarning] = useState(false)

  const noLayout = typeof window !== "undefined" && (routesWithoutLayout.indexOf(window.location.pathname) > -1);

  // Create refs for the tour
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
  }, [stripePromise])

  useEffect(() => {
    if (!wasmLoading && !AuthLoading && !reportsLoading && !userLoading && window.location.pathname !== "/callback" && loadingComponents.indexOf("wasmprovider") < 0 && !initialLoadCompleted) {
      setGlobalLoading(false)
      setInitialLoadCompleted(true)
    }
  }, [wasmLoading, AuthLoading, reportsLoading, window.location.pathname, loadingComponents.length])

  useEffect(() => {
    if (adminRoutes.indexOf(window.location.pathname) && user && !user.config?.admin) {
      router.push("/dashboard")
    }
  }, [window.location.pathname])

  // useEffect(() => {
  //   if (user?.preferences?.tour_enabled && window.location.pathname === "/dashboard" && !initialTourStarted) {
  //     setInitialTourStarted(true)
  //     setEnableTour(true)
  //   } else {
  //     enableTour && setEnableTour(false)
  //   }
  // }, [user, window.location.pathname])

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
              <FilteredRequirementsProvider reports={reports}>
                <AllReportsProvider>
                  <RegulatoryFrameworksProvider>
                    <FilesProvider>
                      <TourComponent startTour={user?.preferences?.tour_enabled || false} reportsRef={reportsRef} regulatoryFrameworksRef={regulatoryFrameworksRef} filesRef={filesRef} tasksRef={tasksRef} newReportButtonRef={newReportButtonRef} />
                      <Content className="pt-8 pb-8 px-4 sm:px-8 container h-full">
                        <div className="bg-white p-6 rounded shadow-sm h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                          {children}
                        </div>
                      </Content>
                    </FilesProvider>
                  </RegulatoryFrameworksProvider>
                </AllReportsProvider>
              </FilteredRequirementsProvider>
            </Layout>
          </Layout>
        </ConfigProvider>
      </Elements>
    </AntdRegistry>

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
          <AuthProvider>
            <UserProvider>
              <SearchParamsProvider>
                <SelectedFilteredReportsProvider>
                  <LayoutWithWasm>{children}</LayoutWithWasm>
                </SelectedFilteredReportsProvider>
              </SearchParamsProvider>
            </UserProvider>
          </AuthProvider>
        </WasmProviderComponent>
      </body>
    </html>
  );
}


// "use client";

// import localFont from "next/font/local";
// import type { ReactNode } from "react";
// import dynamic from "next/dynamic";
// import { AuthProvider } from "@/components/Auth0";
// import { AntdRegistry } from '@ant-design/nextjs-registry';
// import { ConfigProvider, Layout } from 'antd';
// import { antdconfig } from '@/../antd-config';
// import AppSider from '@/components/sidebar';
// import '@/styles/globals.css';
// import LoadingLogoScreen from "@/components/loading-screen";
// import WasmProviderComponent from "@/components/WasmProvider";

// // const WasmProvider = dynamic(() => import("@/components/WasmProvider"), {
// //   ssr: false,
// //   loading: () => <LoadingLogoScreen />,
// // });

// const { Content } = Layout;

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: ReactNode;
// }>) {
//   console.log("WasmProviderComponent", WasmProviderComponent)
//   return (
//     <html lang="en" className="h-full">
//       <body className="h-full">
//         <WasmProviderComponent>
//           <AuthProvider>
//             <AntdRegistry>
//               <ConfigProvider theme={antdconfig}>
//                 <Layout className="h-full" style={{ minWidth: 1200 }}>
//                   <AppSider />
//                   <Layout className="h-full">
//                     <Content className="pt-8 pb-8 px-4 sm:px-8 container h-full">
//                       <div className="bg-white p-6 rounded shadow-sm h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
//                         {children}
//                       </div>
//                     </Content>
//                   </Layout>
//                 </Layout>
//               </ConfigProvider>
//             </AntdRegistry>
//           </AuthProvider>
//         </WasmProviderComponent>
//       </body>
//     </html>
//   );
// }
