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

// Global state to track initialization
let globalWasmModule: typeof WasmModule | null = null;
let initializationPromise: Promise<typeof WasmModule> | null = null;

async function getWasmModule(): Promise<typeof WasmModule> {
  if (globalWasmModule) {
    return globalWasmModule;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      const jsModule = await import("@wasm");
      await jsModule.default();
      jsModule.hydrate();
      globalWasmModule = jsModule;
      return jsModule;
    } catch (error) {
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

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
    let mounted = true;

    const initWasm = async () => {
      try {
        const wasmInstance = await getWasmModule();
        if (mounted) {
          setWasmModule(wasmInstance);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("WASM initialization error:", err);
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to initialize WASM",
          );
          setIsLoading(false);
        }
      }
    };

    initWasm();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <WasmContext.Provider value={{ wasmModule, isLoading, error }}>
      {children}
    </WasmContext.Provider>
  );
}

export default WasmProviderComponent;
