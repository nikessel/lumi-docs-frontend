"use client";

import dynamic from "next/dynamic";
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

const { Content } = Layout;

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function LayoutWithWasm({ children }: { children: ReactNode }) {
  const { isLoading: wasmLoading } = useWasm(); // Now inside the provider context
  const { isLoading: AuthLoading } = useAuth()
  const { loading: reportsLoading } = useAllReports()
  const loadingComponents = useLoadingStore((state) => state.loadingComponents)

  const allLoading = loadingComponents.indexOf("wasmprovider") > -1 || wasmLoading || AuthLoading || reportsLoading

  const noLayout = typeof window !== "undefined" && (window.location.pathname === "/documentation" || window.location.pathname === "/logout");

  // if (window.location.pathname === "/callback") {
  //   return <div>{children}</div>
  // }

  if (allLoading || window.location.pathname === "/callback") {
    return <LoadingLogoScreen>{window.location.pathname === "/callback" ? children : ""}</LoadingLogoScreen>;
  }

  return (
    <AntdRegistry>
      <Elements stripe={stripePromise}>
        <ConfigProvider theme={antdconfig}>
          <Layout className="h-full" style={{ minWidth: 1200 }}>
            {!noLayout ? <AppSider /> : ""}
            <Layout className="h-full">
              <AllReportsProvider>
                <RegulatoryFrameworksProvider>
                  <FilesProvider>
                    <UserProvider>
                      <Content className="pt-8 pb-8 px-4 sm:px-8 container h-full">
                        <div className="bg-white p-6 rounded shadow-sm h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                          {children}
                        </div>
                      </Content>
                    </UserProvider>
                  </FilesProvider>
                </RegulatoryFrameworksProvider>
              </AllReportsProvider>
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
            <LayoutWithWasm>{children}</LayoutWithWasm>
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
