// WasmAuth0Config.tsx
import React, { useState, useEffect } from "react";
import type {
  GetPublicAuth0ConfigResponse,
  GetPublicAuth0ConfigOutput,
} from "@wasm";
import type * as WasmModule from "@wasm";

const Auth0Config = () => {
  const [config, setConfig] = useState<
    GetPublicAuth0ConfigOutput["result"] | null
  >(null);
  const [wasmModule, setWasmModule] = useState<typeof WasmModule | null>(null);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initWasm = async () => {
      try {
        const jsModule = await import("@wasm");
        await jsModule.default();
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

  const fetchConfig = async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const response: GetPublicAuth0ConfigResponse =
        await wasmModule.get_public_auth0_config();

      if (response.error) {
        setError(`${response.error.kind} error: ${response.error.message}`);
        setConfig(null);
        return;
      }

      if (response.data) {
        setConfig(response.data.result);
        setError(undefined);
      } else {
        setError("No data received");
        setConfig(null);
      }
    } catch (err) {
      console.error("Auth0 config fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Error fetching Auth0 config",
      );
      setConfig(null);
    }
  };

  return (
    <div className="space-y-4 text-black">
      <button
        onClick={fetchConfig}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:text-gray-200"
        disabled={isLoading}
      >
        Fetch Auth0 Config
      </button>

      {isLoading && (
        <div className="text-blue-600 font-medium">Loading WASM module...</div>
      )}
      {error && <div className="text-red-600 font-medium">Error: {error}</div>}
      {config && (
        <div className="p-4 bg-white border rounded">
          <h3 className="font-semibold mb-2">Auth0 Configuration:</h3>
          <dl className="space-y-2">
            <dt className="font-medium">Domain:</dt>
            <dd className="ml-4">{config.domain}</dd>
            <dt className="font-medium">Client ID:</dt>
            <dd className="ml-4">{config.client_id}</dd>
            <dt className="font-medium">Login Redirect URI:</dt>
            <dd className="ml-4">{config.login_redirect_uri}</dd>
            <dt className="font-medium">Logout Redirect URI:</dt>
            <dd className="ml-4">{config.logout_redirect_uri}</dd>
          </dl>
        </div>
      )}
    </div>
  );
};

export default Auth0Config;
