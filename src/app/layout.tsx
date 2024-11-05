// src/app/layout.tsx
"use client"; // Ensure this component is client-side only

import localFont from "next/font/local";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import "./globals.css";
import { AuthProvider } from "@/components/Auth0";

// Dynamically load WasmProvider if needed
const WasmProvider = dynamic(() => import("@/components/WasmProvider"), {
  ssr: false,
  loading: () => <div>Loading WASM provider...</div>,
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <meta name="color-scheme" content="light only" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased light`}
      >
        <WasmProvider>
          <AuthProvider>{children}</AuthProvider>
        </WasmProvider>
      </body>
    </html>
  );
}
