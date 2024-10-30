// src/components/WasmEcho.tsx
'use client';

import { useState, useEffect } from 'react';

type EchoInput = { input: string };
type EchoOutput = { result: string };

export default function WasmEcho() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [wasmModule, setWasmModule] = useState<any>(null);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initWasm = async () => {
      try {
        const jsModule = await import('../pkg/lumi_docs_app.js');
        await jsModule.default();
        setWasmModule(jsModule);
        setIsLoading(false);
      } catch (err) {
        console.error('WASM initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize WASM');
        setIsLoading(false);
      }
    };

    initWasm();
  }, []);

  const handleEcho = async () => {
    if (!wasmModule) {
      setError('WASM module not loaded');
      return;
    }

    try {
      const response = await wasmModule.echo({ input });
      setOutput(response.result);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error executing echo function');
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
        <div className="text-blue-600 font-medium">
          Loading WASM module...
        </div>
      )}
      
      {error && (
        <div className="text-red-600 font-medium">
          Error: {error}
        </div>
      )}
      
      {output && (
        <div className="p-4 bg-white border rounded text-black">
          {output}
        </div>
      )}
    </div>
  );
}
