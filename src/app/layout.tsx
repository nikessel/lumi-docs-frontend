"use client";

import localFont from "next/font/local";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/components/Auth0";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, Layout } from 'antd';
import { antdconfig } from '@/../antd-config';
import AppSider from '@/components/sidebar';
import '@/styles/globals.css';
import LoadingLogoScreen from "@/components/loading-screen";

const WasmProvider = dynamic(() => import("@/components/WasmProvider"), {
  ssr: false,
  loading: () => <LoadingLogoScreen />,
});

const { Content } = Layout;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <WasmProvider>
          <AuthProvider>
            <AntdRegistry>
              <ConfigProvider theme={antdconfig}>
                <Layout className="h-full" style={{ minWidth: 1200 }}>
                  <AppSider />
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
        </WasmProvider>
      </body>
    </html>
  );
}
