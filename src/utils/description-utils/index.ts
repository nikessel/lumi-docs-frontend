import type * as WasmModule from "@wasm";
import type { Device, Company } from "@wasm";
import { fetchWrapper } from "@/utils/error-handling-utils/fetchWrapper";

export async function getDeviceDescriptions(
    wasmModule: typeof WasmModule | null
): Promise<{ devices: Device[]; error: string | null }> {
    if (!wasmModule) {
        console.error("❌ Error: WASM module not loaded.");
        return {
            devices: [],
            error: "WASM module not loaded",
        };
    }

    const { data, error } = await fetchWrapper(() => wasmModule.get_all_devices());

    return {
        devices: data?.output?.output || [],
        error: error || null,
    };
}

export async function getAllCompanies(
    wasmModule: typeof WasmModule | null
): Promise<{ companies: Company[]; error: string | null }> {
    if (!wasmModule) {
        console.error("❌ Error: WASM module not loaded.");
        return {
            companies: [],
            error: "WASM module not loaded",
        };
    }

    const { data, error } = await fetchWrapper(() => wasmModule.get_all_companies());

    return {
        companies: data?.output?.output || [],
        error: error || null,
    };
}