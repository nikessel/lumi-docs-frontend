import type { Requirement } from "@wasm";
import type * as WasmModule from "@wasm";

export async function fetchRequirementsByIds(
    wasmModule: typeof WasmModule | null,
    requirementIds: string[]
): Promise<{ requirements: Requirement[]; errors: { [id: string]: string } }> {
    console.log(`📌 Fetching requirements for IDs: ${requirementIds.join(", ")}`);

    const result: { requirements: Requirement[]; errors: { [id: string]: string } } = {
        requirements: [],
        errors: {},
    };

    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        return result;
    }

    const fetchPromises = requirementIds.map(async (id) => {
        try {
            console.log(`🔄 Fetching requirement with ID: ${id}`);
            const response = await wasmModule.get_requirement({ input: id });

            if (response.output) {
                const requirement = response.output.output;
                console.log(`✅ Successfully fetched requirement: ${id}`);
                result.requirements.push(requirement);
            } else if (response.error) {
                console.error(`❌ Error fetching requirement ${id}: ${response.error.message}`);
                result.errors[id] = response.error.message;
            }
        } catch (err) {
            console.error(`❌ Failed to fetch requirement ${id}:`, err);
            result.errors[id] = "Failed to fetch requirement";
        }
    });

    await Promise.all(fetchPromises);
    return result;
}


