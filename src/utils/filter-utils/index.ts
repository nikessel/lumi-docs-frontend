import type * as WasmModule from "@wasm";
import type { Description, RegulatoryFramework } from "@wasm";
import { fetchWrapper } from "@/utils/error-handling-utils/fetchWrapper";

export async function getDefaultSelection(
    wasmModule: typeof WasmModule | null,
    descriptions: Description[],
    regulatoryFramework: RegulatoryFramework
): Promise<{ requirements: string[]; error: string | null }> {

    if (!wasmModule) {
        console.error("❌ Error: WASM module not loaded.");
        return {
            requirements: [],
            error: "WASM module not loaded",
        };
    }

    const { data, error } = await fetchWrapper(() => wasmModule.get_default_selected_requirement_ids({
        descriptions: descriptions,
        regulatory_framework: regulatoryFramework
    }));

    return {
        requirements: data?.output?.output || [],
        error: error || null,
    };
}