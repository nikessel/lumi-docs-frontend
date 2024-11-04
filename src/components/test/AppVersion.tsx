// AppVersion.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useWasm } from "@/components/WasmProvider";
import type { AppVersionResponse } from "@wasm";

export default function AppVersion() {
  const { wasmModule, isLoading, error: wasmError } = useWasm();
  const [version, setVersion] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  const fetchVersion = useCallback(async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const response: AppVersionResponse = await wasmModule.app_version();

      if (response.error) {
        setError(`${response.error.kind} error: ${response.error.message}`);
        setVersion(null);
        return;
      }

      if (response.output) {
        setVersion(response.output.output);
        setError(undefined);
      } else {
        setError("No version information received");
        setVersion(null);
      }
    } catch (err) {
      console.error("Version fetch error:", err);
      setError(err instanceof Error ? err.message : "Error fetching version");
      setVersion(null);
    }
  }, [wasmModule]); // Only depends on wasmModule

  // Automatically fetch version when component mounts
  useEffect(() => {
    if (!isLoading && wasmModule) {
      fetchVersion();
    }
  }, [isLoading, wasmModule, fetchVersion]); // fetchVersion is now stable

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <button
          onClick={fetchVersion}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:text-gray-200"
          disabled={isLoading}
        >
          Refresh Version
        </button>
        {version && (
          <span className="text-gray-900 font-medium">Version: {version}</span>
        )}
      </div>
      {isLoading && (
        <div className="text-blue-600 font-medium">Loading WASM module...</div>
      )}
      {(error || wasmError) && (
        <div className="text-red-600 font-medium">
          Error: {error || wasmError}
        </div>
      )}
    </div>
  );
}
