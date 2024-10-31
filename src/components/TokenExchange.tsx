// TokenExchange.tsx
"use client";
import { useState } from "react";
import { useWasm } from "./WasmProvider";
import type { ExchangeCodeForIdentityInput, AuthIdentity } from "@wasm";

export default function TokenExchange() {
  const { wasmModule, isLoading, error: wasmError } = useWasm();
  const [code, setCode] = useState("");
  const [authIdentity, setAuthIdentity] = useState<AuthIdentity | null>(null);
  const [error, setError] = useState<string>();

  const handleExchange = async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const input: ExchangeCodeForIdentityInput = { code };
      const response = await wasmModule.exchange_code_for_identity(input);

      if (response.error) {
        setError(`${response.error.kind} error: ${response.error.message}`);
        setAuthIdentity(null);
        return;
      }

      if (response.output) {
        setAuthIdentity(response.output.output);
        setError(undefined);
      } else {
        setError("No output received");
        setAuthIdentity(null);
      }
    } catch (err) {
      console.error("Token exchange error:", err);
      setError(err instanceof Error ? err.message : "Error exchanging token");
      setAuthIdentity(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter authorization code"
          className="px-3 py-2 border rounded flex-grow"
          disabled={isLoading}
        />
        <button
          onClick={handleExchange}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:text-gray-200"
          disabled={isLoading || !code}
        >
          Exchange Code
        </button>
      </div>
      {isLoading && (
        <div className="text-blue-600 font-medium">Loading WASM module...</div>
      )}
      {(error || wasmError) && (
        <div className="text-red-600 font-medium">
          Error: {error || wasmError}
        </div>
      )}
      {authIdentity && (
        <div className="p-4 bg-gray-50 border rounded">
          <h3 className="font-semibold mb-2">Auth Identity:</h3>
          <dl className="space-y-2">
            <dt className="font-medium">Authenticated:</dt>
            <dd className="ml-4">
              {authIdentity.is_authenticated ? "Yes" : "No"}
            </dd>
            <dt className="font-medium">Admin:</dt>
            <dd className="ml-4">
              {authIdentity.identity.is_admin ? "Yes" : "No"}
            </dd>
            <dt className="font-medium">Access Token:</dt>
            <dd className="ml-4 break-all">
              {authIdentity.identity.access_token}
            </dd>
            <dt className="font-medium">ID Token:</dt>
            <dd className="ml-4 break-all">{authIdentity.identity.id_token}</dd>
            <dt className="font-medium">Refresh Token:</dt>
            <dd className="ml-4 break-all">
              {authIdentity.identity.refresh_token}
            </dd>
          </dl>
        </div>
      )}
    </div>
  );
}
