// WasmEcho.tsx
import { useState, useEffect } from "react";
import type { EchoArgs, EchoResponse } from "@wasm";
import type * as WasmModule from "@wasm";

export default function Echo() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
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

  const handleEcho = async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const args: EchoArgs = { input };
      const response: EchoResponse = await wasmModule.echo(args);

      if (response.error) {
        setError(`${response.error.kind} error: ${response.error.message}`);
        setOutput("");
        return;
      }

      if (response.data) {
        setOutput(response.data.result);
        setError(undefined);
      } else {
        setError("No data received");
        setOutput("");
      }
    } catch (err) {
      console.error("Echo execution error:", err);
      setError(
        err instanceof Error ? err.message : "Error executing echo function",
      );
      setOutput("");
    }
  };

  return (
    <div className="space-y-4 text-black">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to echo"
          className="px-3 py-2 border rounded text-black bg-white"
          disabled={isLoading}
        />
        <button
          onClick={handleEcho}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:text-gray-200"
          disabled={isLoading}
        >
          Echo
        </button>
      </div>
      {isLoading && (
        <div className="text-blue-600 font-medium">Loading WASM module...</div>
      )}
      {error && <div className="text-red-600 font-medium">Error: {error}</div>}
      {output && (
        <div className="p-4 bg-white border rounded text-black">{output}</div>
      )}
    </div>
  );
}
