import type { Requirement } from "@wasm";
import type * as WasmModule from "@wasm";
import { RequirementWithGroupId } from "@/hooks/requirement-hooks";
import { fetchWrapper } from "../error-handling-utils/fetchWrapper";

export async function fetchRequirementsByIds(
    wasmModule: typeof WasmModule | null,
    requirementIds: string[]
): Promise<{ requirements: Requirement[]; errors: { [id: string]: string } }> {
    console.log(`📌 Fetching requirements for IDs: ${requirementIds.join(", ")}`);

    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        return {
            requirements: [],
            errors: Object.fromEntries(requirementIds.map(id => [id, "WASM module not loaded"])),
        };
    }

    const results: { requirements: Requirement[]; errors: { [id: string]: string } } = { requirements: [], errors: {} };

    const fetchPromises = requirementIds.map(async (id) => {
        const { data, error } = await fetchWrapper(() => wasmModule.get_requirement({ input: id }));

        if (data?.output) {
            results.requirements.push(data.output.output);
        } else {
            results.errors[id] = error || `Failed to fetch requirement ${id}`;
            console.error(`❌ Error fetching requirement ${id}: ${error}`);
        }
    });

    await Promise.allSettled(fetchPromises); // Ensures all requests complete

    return results;
}



export async function fetchRequirementsByGroupIds(
    wasmModule: typeof WasmModule | null,
    groupIds: string[]
): Promise<{ requirements: RequirementWithGroupId[]; errors: { [id: string]: string } }> {
    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        return {
            requirements: [],
            errors: Object.fromEntries(groupIds.map(id => [id, "WASM module not loaded"])),
        };
    }

    const results: { requirements: RequirementWithGroupId[]; errors: { [id: string]: string } } = { requirements: [], errors: {} };

    const fetchPromises = groupIds.map(async (groupId) => {
        const { data, error } = await fetchWrapper(() => wasmModule.get_requirements_by_group({ input: groupId }));

        if (data?.output) {
            const fetchedRequirements = data.output.output.map(req => ({
                ...req,
                group_id: groupId, // Ensure each requirement has group_id
            }));
            results.requirements.push(...fetchedRequirements);
        } else {
            results.errors[groupId] = error || `Failed to fetch requirements for group ID ${groupId}`;
            console.error(`❌ Error fetching requirements for group ID ${groupId}: ${error}`);
        }
    });

    await Promise.allSettled(fetchPromises); // Ensures all requests complete

    return results;
}

