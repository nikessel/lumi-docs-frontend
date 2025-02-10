import type { RequirementGroup } from "@wasm";
import type * as WasmModule from "@wasm";
import { RequirementGroupWithSectionId } from "@/hooks/requirement-group-hooks";

export async function fetchRequirementGroupsByIds(
    wasmModule: typeof WasmModule | null,
    groupIds: string[]
): Promise<{ requirementGroups: RequirementGroup[]; errors: { [id: string]: string } }> {
    console.log(`📌 Fetching requirement groups for IDs: ${groupIds.join(", ")}`);

    const result: { requirementGroups: RequirementGroup[]; errors: { [id: string]: string } } = {
        requirementGroups: [],
        errors: {},
    };

    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        return result;
    }

    const fetchPromises = groupIds.map(async (id) => {
        try {
            console.log(`🔄 Fetching requirement group with ID: ${id}`);
            const response = await wasmModule.get_requirement_group({ input: id });

            if (response.output) {
                const group = response.output.output;
                console.log(`✅ Successfully fetched requirement group: ${id}`);
                result.requirementGroups.push(group);
            } else if (response.error) {
                console.error(`❌ Error fetching requirement group ${id}: ${response.error.message}`);
                result.errors[id] = response.error.message;
            }
        } catch (err) {
            console.error(`❌ Failed to fetch requirement group ${id}:`, err);
            result.errors[id] = "Failed to fetch requirement group";
        }
    });

    await Promise.all(fetchPromises);
    return result;
}

export async function fetchGroupsBySectionIds(
    wasmModule: typeof WasmModule | null,
    sectionIds: string[]
): Promise<{ requirementGroups: RequirementGroupWithSectionId[]; errors: { [id: string]: string } }> {

    const result: { requirementGroups: RequirementGroupWithSectionId[]; errors: { [id: string]: string } } = {
        requirementGroups: [],
        errors: {},
    };

    if (!wasmModule) {
        return result;
    }

    const fetchPromises = sectionIds.map(async (sectionId) => {
        try {
            const response = await wasmModule.get_requirement_groups_by_section({ input: sectionId });

            if (response.output?.output) {
                const groupsWithSectionId = response.output.output.map((group) => ({
                    ...group,
                    section_id: sectionId, // Ensure section_id is included
                }));

                result.requirementGroups.push(...groupsWithSectionId);
            } else if (response.error) {
                console.error(`❌ Error fetching requirement groups for section ID ${sectionId}: ${response.error.message}`);
                result.errors[sectionId] = response.error.message;
            }
        } catch (err) {
            console.error(`❌ Failed to fetch requirement groups for section ID ${sectionId}:`, err);
            result.errors[sectionId] = "Failed to fetch requirement groups";
        }
    });

    await Promise.all(fetchPromises);
    return result;
}
