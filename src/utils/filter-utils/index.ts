import type * as WasmModule from "@wasm";
import type { Description, RegulatoryFramework, GetDefaultSelectedRequirementIdsInput, GetApplicableFieldPathsInput, GetDefaultSelectionFieldPathsInput, GetMultipleDefaultSelectedRequirementIdsInput } from "@wasm";
import { fetchWrapper } from "@/utils/error-handling-utils/fetchWrapper";

export async function getDefaultSelection(
    wasmModule: typeof WasmModule | null,
    defaultSelectionInput: GetDefaultSelectedRequirementIdsInput,
): Promise<{ requirements: string[]; error: string | null }> {
    if (!wasmModule) {
        return {
            requirements: [],
            error: "WASM module not loaded",
        };
    }

    try {
        const { data, error } = await fetchWrapper(() =>
            wasmModule.get_default_selected_requirement_ids(defaultSelectionInput)
        );

        if (error) {
            return {
                requirements: [],
                error
            };
        }

        return {
            requirements: data?.output?.output || [],
            error: null
        };
    } catch (err) {
        return {
            requirements: [],
            error: err instanceof Error ? err.message : "Unknown error occurred"
        };
    }
}

export async function getApplicableFieldPaths(
    wasmModule: typeof WasmModule | null,
    input: GetApplicableFieldPathsInput,
): Promise<{ fieldPaths: Map<string, string[]>; error: string | null }> {
    if (!wasmModule) {
        return {
            fieldPaths: new Map(),
            error: "WASM module not loaded",
        };
    }

    try {
        const { data, error } = await fetchWrapper(() =>
            wasmModule.get_applicable_field_paths(input)
        );

        if (error) {
            return {
                fieldPaths: new Map(),
                error
            };
        }

        return {
            fieldPaths: data?.output?.output || new Map(),
            error: null
        };
    } catch (err) {
        return {
            fieldPaths: new Map(),
            error: err instanceof Error ? err.message : "Unknown error occurred"
        };
    }
}

export async function getDefaultSelectionFieldPaths(
    wasmModule: typeof WasmModule | null,
    input: GetDefaultSelectionFieldPathsInput,
): Promise<{ fieldPaths: Map<string, string[]>; error: string | null }> {
    if (!wasmModule) {
        return {
            fieldPaths: new Map(),
            error: "WASM module not loaded",
        };
    }

    try {
        const { data, error } = await fetchWrapper(() =>
            wasmModule.get_default_selection_field_paths(input)
        );

        console.log("!!!!!!13123123", input, data)

        if (error) {
            return {
                fieldPaths: new Map(),
                error
            };
        }

        return {
            fieldPaths: data?.output?.output || new Map(),
            error: null
        };
    } catch (err) {
        return {
            fieldPaths: new Map(),
            error: err instanceof Error ? err.message : "Unknown error occurred"
        };
    }
}

export async function getMultipleDefaultSelectedRequirementIds(
    wasmModule: typeof WasmModule | null,
    input: GetMultipleDefaultSelectedRequirementIdsInput,
): Promise<{ requirements: string[]; error: string | null }> {
    if (!wasmModule) {
        return {
            requirements: [],
            error: "WASM module not loaded",
        };
    }

    try {
        const { data, error } = await fetchWrapper(() =>
            wasmModule.get_multiple_default_selected_requirement_ids(input)
        );

        if (error) {
            return {
                requirements: [],
                error
            };
        }

        return {
            requirements: Array.isArray(data?.output?.output) ? data.output.output : [],
            error: null
        };
    } catch (err) {
        return {
            requirements: [],
            error: err instanceof Error ? err.message : "Unknown error occurred"
        };
    }
}