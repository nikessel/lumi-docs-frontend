// page.tsx
"use client";
import dynamic from "next/dynamic";

const WasmProvider = dynamic(() => import("@/components/WasmProvider"), {
  ssr: false,
  loading: () => <div>Loading WASM provider...</div>,
});

const Echo = dynamic(() => import("@/components/Echo"), {
  ssr: false,
  loading: () => <div>Loading Echo component...</div>,
});

const Auth0Config = dynamic(() => import("@/components/Auth0Config"), {
  ssr: false,
  loading: () => <div>Loading Auth0Config component...</div>,
});

const TokenExchange = dynamic(() => import("@/components/TokenExchange"), {
  ssr: false,
  loading: () => <div>Loading Token Exchange component...</div>,
});

const TokenClaims = dynamic(() => import("@/components/TokenClaims"), {
  ssr: false,
  loading: () => <div>Loading Token Claims component...</div>,
});

const AppVersion = dynamic(() => import("@/components/AppVersion"), {
  ssr: false,
  loading: () => <div>Loading App Version component...</div>,
});

export default function Home() {
  return (
    <main className="p-8 bg-white">
      <WasmProvider>
        <section className="mb-8">
          <h2 className="text-xl mb-4">App Version</h2>
          <AppVersion />
        </section>
        <section className="mb-8">
          <h2 className="text-xl mb-4">Echo Test</h2>
          <Echo />
        </section>
        <section className="mb-8">
          <h2 className="text-xl mb-4">Auth0 Config Test</h2>
          <Auth0Config />
        </section>
        <section className="mb-8">
          <h2 className="text-xl mb-4">Token Exchange</h2>
          <TokenExchange />
        </section>
        <section className="mb-8">
          <h2 className="text-xl mb-4">Token Claims</h2>
          <TokenClaims />
        </section>
      </WasmProvider>
    </main>
  );
}
