// Echo.tsx
"use client";
import { useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import type { EchoInput, EchoResponse } from "@wasm";

function Echo() {
  const { wasmModule, isLoading, error: wasmError } = useWasm();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string>();

  const handleEcho = async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const args: EchoInput = { input };
      const response: EchoResponse = await wasmModule.echo(args);

      if (response.error) {
        setError(`${response.error.kind} error: ${response.error.message}`);
        setOutput("");
        return;
      }

      if (response.output) {
        setOutput(response.output.output);
        setError(undefined);
      } else {
        setError("No output received");
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
      {(error || wasmError) && (
        <div className="text-red-600 font-medium">
          Error: {error || wasmError}
        </div>
      )}
      {output && (
        <div className="p-4 bg-white border rounded text-black">{output}</div>
      )}
    </div>
  );
}

export default Echo;
