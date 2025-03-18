import type { RequirementGroup } from "@wasm";
import type * as WasmModule from "@wasm";
import { RequirementGroupWithSectionId } from "@/hooks/requirement-group-hooks";
import { fetchWrapper } from "../error-handling-utils/fetchWrapper";

export async function fetchRequirementGroupsByIds(
    wasmModule: typeof WasmModule | null,
    groupIds: string[]
): Promise<{ requirementGroups: RequirementGroup[]; errors: { [id: string]: string } }> {
    console.log(`📌 Fetching requirement groups for IDs: ${groupIds.join(", ")}`);

    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        return {
            requirementGroups: [],
            errors: Object.fromEntries(groupIds.map(id => [id, "WASM module not loaded"])),
        };
    }

    const results: { requirementGroups: RequirementGroup[]; errors: { [id: string]: string } } = { requirementGroups: [], errors: {} };

    const fetchPromises = groupIds.map(async (id) => {
        const { data, error } = await fetchWrapper(() => wasmModule.get_requirement_group({ input: id }));

        if (data?.output) {
            results.requirementGroups.push(data.output.output);
        } else {
            results.errors[id] = error || `Failed to fetch requirement group ${id}`;
            console.error(`❌ Error fetching requirement group ${id}: ${error}`);
        }
    });

    await Promise.allSettled(fetchPromises); // Ensures all requests complete

    return results;
}


export async function fetchGroupsBySectionIds(
    wasmModule: typeof WasmModule | null,
    sectionIds: string[]
): Promise<{ requirementGroups: RequirementGroupWithSectionId[]; errors: { [id: string]: string } }> {
    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        return {
            requirementGroups: [],
            errors: Object.fromEntries(sectionIds.map(id => [id, "WASM module not loaded"])),
        };
    }

    const results: { requirementGroups: RequirementGroupWithSectionId[]; errors: { [id: string]: string } } = { requirementGroups: [], errors: {} };

    const fetchPromises = sectionIds.map(async (sectionId) => {
        const { data, error } = await fetchWrapper(() =>
            wasmModule.get_requirement_groups_by_section({ input: sectionId })
        );

        if (data?.output) {
            const groupsWithSectionId = data.output.output.map(group => ({
                ...group,
                section_id: sectionId, // Ensure section_id is included
            }));
            results.requirementGroups.push(...groupsWithSectionId);
        } else {
            results.errors[sectionId] = error || `Failed to fetch requirement groups for section ID ${sectionId}`;
            console.error(`❌ Error fetching requirement groups for section ID ${sectionId}: ${error}`);
        }
    });

    await Promise.allSettled(fetchPromises); // Ensures all requests complete

    return results;
}
