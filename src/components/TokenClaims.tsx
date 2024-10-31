// TokenClaims.tsx
"use client";
import { useState } from "react";
import { useWasm } from "./WasmProvider";
import type { TokenToClaimsInput, Claims } from "@wasm";

export default function TokenClaims() {
  const { wasmModule, isLoading, error: wasmError } = useWasm();
  const [token, setToken] = useState("");
  const [claims, setClaims] = useState<Claims | null>(null);
  const [error, setError] = useState<string>();

  const handleGetClaims = async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const input: TokenToClaimsInput = { token };
      const response = await wasmModule.token_to_claims(input);

      if (response.error) {
        setError(`${response.error.kind} error: ${response.error.message}`);
        setClaims(null);
        return;
      }

      if (response.output) {
        setClaims(response.output.output);
        setError(undefined);
      } else {
        setError("No output received");
        setClaims(null);
      }
    } catch (err) {
      console.error("Claims retrieval error:", err);
      setError(err instanceof Error ? err.message : "Error getting claims");
      setClaims(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter token"
          className="px-3 py-2 border rounded flex-grow"
          disabled={isLoading}
        />
        <button
          onClick={handleGetClaims}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:text-gray-200"
          disabled={isLoading || !token}
        >
          Get Claims
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
      {claims && (
        <div className="p-4 bg-gray-50 border rounded">
          <h3 className="font-semibold mb-2">Token Claims:</h3>
          <dl className="space-y-2">
            <dt className="font-medium">Name:</dt>
            <dd className="ml-4">{claims.name}</dd>
            <dt className="font-medium">Email:</dt>
            <dd className="ml-4">{claims.email}</dd>
            <dt className="font-medium">Email Verified:</dt>
            <dd className="ml-4">{claims.email_verified ? "Yes" : "No"}</dd>
            <dt className="font-medium">Nickname:</dt>
            <dd className="ml-4">{claims.nickname}</dd>
            {claims.given_name && (
              <>
                <dt className="font-medium">Given Name:</dt>
                <dd className="ml-4">{claims.given_name}</dd>
              </>
            )}
            {claims.family_name && (
              <>
                <dt className="font-medium">Family Name:</dt>
                <dd className="ml-4">{claims.family_name}</dd>
              </>
            )}
            <dt className="font-medium">Picture:</dt>
            <dd className="ml-4">{claims.picture}</dd>
            <dt className="font-medium">Updated At:</dt>
            <dd className="ml-4">{claims.updated_at}</dd>
            <dt className="font-medium">Subject:</dt>
            <dd className="ml-4">{claims.sub}</dd>
            <dt className="font-medium">Issuer:</dt>
            <dd className="ml-4">{claims.iss}</dd>
            <dt className="font-medium">Audience:</dt>
            <dd className="ml-4">{claims.aud}</dd>
            <dt className="font-medium">Session ID:</dt>
            <dd className="ml-4">{claims.sid}</dd>
            <dt className="font-medium">Issued At:</dt>
            <dd className="ml-4">
              {new Date(claims.iat * 1000).toLocaleString()}
            </dd>
            <dt className="font-medium">Expires At:</dt>
            <dd className="ml-4">
              {new Date(claims.exp * 1000).toLocaleString()}
            </dd>
          </dl>
        </div>
      )}
    </div>
  );
}
