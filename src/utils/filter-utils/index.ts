import type * as WasmModule from "@wasm";
import type { Description, RegulatoryFramework, GetDefaultSelectedRequirementIdsInput } from "@wasm";
import { fetchWrapper } from "@/utils/error-handling-utils/fetchWrapper";

export async function getDefaultSelection(
    wasmModule: typeof WasmModule | null,
    defaultSelectionInput: GetDefaultSelectedRequirementIdsInput[],
): Promise<{ requirements: string[]; error: string | null }> {
    if (!wasmModule) {
        return {
            requirements: [],
            error: "WASM module not loaded",
        };
    }

    try {
        // Process each description in parallel
        const results = await Promise.allSettled(
            defaultSelectionInput.map(input =>
                fetchWrapper(() => wasmModule.get_default_selected_requirement_ids(input))
            )
        );

        // Collect all successful results and errors
        const allIds: string[] = [];
        const errors: string[] = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const { data, error } = result.value;
                if (error) {
                    errors.push(`Error processing description ${index}: ${error}`);
                } else if (data?.output?.output) {
                    allIds.push(...data.output.output);
                }
            } else {
                errors.push(`Failed to process description ${index}: ${result.reason}`);
            }
        });

        // If we have any errors, return them
        if (errors.length > 0) {
            return {
                requirements: [],
                error: errors.join('; ')
            };
        }

        // Ensure we have unique IDs
        const uniqueIds = [...new Set(allIds)];

        return {
            requirements: uniqueIds,
            error: null
        };
    } catch (err) {
        return {
            requirements: [],
            error: err instanceof Error ? err.message : "Unknown error occurred"
        };
    }
}