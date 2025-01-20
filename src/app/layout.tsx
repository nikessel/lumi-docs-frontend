"use client";

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

const { Content } = Layout;

function LayoutWithWasm({ children }: { children: ReactNode }) {
  const { isLoading: wasmLoading } = useWasm(); // Now inside the provider context
  const isDocumentationPage = typeof window !== "undefined" && window.location.pathname === "/documentation";

  if (wasmLoading) {
    return <LoadingLogoScreen />;
  }

  return (
    <AuthProvider>
      <AntdRegistry>
        <ConfigProvider theme={antdconfig}>
          <Layout className="h-full" style={{ minWidth: 1200 }}>
            {!isDocumentationPage ? <AppSider /> : ""}
            <Layout className="h-full">
              <Content className="pt-8 pb-8 px-4 sm:px-8 container h-full">
                <div className="bg-white p-6 rounded shadow-sm h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  {children}
                </div>
              </Content>
            </Layout>
          </Layout>
        </ConfigProvider>
      </AntdRegistry>
    </AuthProvider>
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
          <LayoutWithWasm>{children}</LayoutWithWasm>
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
