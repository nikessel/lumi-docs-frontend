"use client";
import dynamic from "next/dynamic";

// Dynamically import WASM components to avoid SSR issues
const Echo = dynamic(() => import("@/components/Echo"), {
  ssr: false,
});
const Auth0Config = dynamic(() => import("@/components/Auth0Config"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="p-8 bg-white">
      <h1 className="text-2xl mb-4">WASM Tests</h1>

      <section className="mb-8">
        <h2 className="text-xl mb-4">Echo Test</h2>
        <Echo />
      </section>

      <section>
        <h2 className="text-xl mb-4">Auth0 Config Test</h2>
        <Auth0Config />
      </section>
    </main>
  );
}
