'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import WASM to avoid SSR issues
const WasmEcho = dynamic(() => import('@/components/WasmEcho'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="p-8 bg-white">
      <h1 className="text-2xl mb-4">WASM Echo Test</h1>
      <WasmEcho />
    </main>
  );
}
