"use client";
import { useState, useEffect } from "react";
import { useWasm } from "@/contexts/wasm-context/WasmProvider";
import { Auth0ConfigPublic } from "@wasm";

export const useAuthConfig = () => {
    const { wasmModule } = useWasm();
    const [authConfig, setAuthConfig] = useState<Auth0ConfigPublic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            if (!wasmModule) {
                setError("WASM module not loaded");
                setIsLoading(false);
                return;
            }

            try {
                const res = await wasmModule.get_public_auth0_config();
                if (res.error || !res.output) {
                    throw new Error(res.error?.message || "Failed to fetch Auth0 config");
                }
                setError("")
                setAuthConfig(res.output.output);
            } catch (err) {
                console.error("Auth0 config error:", err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, [wasmModule]);

    return { authConfig, isLoading, error };
};

