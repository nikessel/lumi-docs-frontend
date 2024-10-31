// WasmProvider.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type * as WasmModule from "@wasm";

interface WasmContextType {
  wasmModule: typeof WasmModule | null;
  isLoading: boolean;
  error: string | undefined;
}

const WasmContext = createContext<WasmContextType>({
  wasmModule: null,
  isLoading: true,
  error: undefined,
});

export function useWasm() {
  const context = useContext(WasmContext);
  if (context === undefined) {
    throw new Error("useWasm must be used within a WasmProvider");
  }
  return context;
}

function WasmProviderComponent({ children }: { children: React.ReactNode }) {
  const [wasmModule, setWasmModule] = useState<typeof WasmModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const initWasm = async () => {
      try {
        const jsModule = await import("@wasm");
        await jsModule.default();
        jsModule.hydrate();
        setWasmModule(jsModule);
        setIsLoading(false);
      } catch (err) {
        console.error("WASM initialization error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize WASM",
        );
        setIsLoading(false);
      }
    };
    initWasm();
  }, []);

  return (
    <WasmContext.Provider value={{ wasmModule, isLoading, error }}>
      {children}
    </WasmContext.Provider>
  );
}

// This is important - export the component as default
export default WasmProviderComponent;
