"use client";
import { useState, useEffect, useCallback } from "react";
import { useWasm } from "./WasmProvider";
import type { TokenToClaimsInput, Claims } from "@wasm";

// Helper function to format timestamps consistently in ISO UTC
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toISOString();
};

export default function TokenClaims() {
  const { wasmModule, isLoading } = useWasm();
  const [claims, setClaims] = useState<Claims | null>(null);
  const [error, setError] = useState<string>();

  const fetchClaims = useCallback(
    async (tokenToUse: string) => {
      if (!wasmModule) {
        setError("WASM module not loaded");
        return;
      }

      try {
        const input: TokenToClaimsInput = { token: tokenToUse };
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
    },
    [wasmModule],
  );

  // Check for stored token on mount and when WASM module becomes available
  useEffect(() => {
    if (!wasmModule || isLoading) return;

    const storedToken = localStorage.getItem("id_token");
    if (storedToken) {
      fetchClaims(storedToken);
    }
  }, [wasmModule, isLoading, fetchClaims]);

  if (isLoading) {
    return (
      <div className="text-blue-600 font-medium">Loading WASM module...</div>
    );
  }

  if (error) {
    return <div className="text-red-600 font-medium">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {claims && (
        <div className="p-4 bg-gray-50 border rounded">
          <h3 className="font-semibold mb-2">Token Claims:</h3>
          <dl className="space-y-2">
            <dt className="font-medium">Id:</dt>
            <dd className="ml-4">{claims.id}</dd>
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
            <dd className="ml-4">{formatTimestamp(claims.iat)}</dd>
            <dt className="font-medium">Expires At:</dt>
            <dd className="ml-4">{formatTimestamp(claims.exp)}</dd>
            <dt className="font-medium">Token Duration:</dt>
            <dd className="ml-4">
              {Math.round((claims.exp - claims.iat) / 3600)} hours
            </dd>
          </dl>
        </div>
      )}
    </div>
  );
}
