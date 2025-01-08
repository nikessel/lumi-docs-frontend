import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils";
import type { RequirementGroup } from "@wasm";
import type * as WasmModule from "@wasm";
import { dbName, dbVersion } from "@/utils/db-utils";

const REQUIREMENT_GROUPS_STORE_NAME = "requirement_groups";
const DB_VERSION = dbVersion;
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchRequirementGroupsByIds(
    wasmModule: typeof WasmModule | null,
    groupIds: string[]
): Promise<{ requirementGroups: RequirementGroup[]; errors: { [id: string]: string } }> {
    const result: { requirementGroups: RequirementGroup[]; errors: { [id: string]: string } } = {
        requirementGroups: [],
        errors: {},
    };

    const cachedRequirementGroups = await getData<RequirementGroup>(
        dbName,
        REQUIREMENT_GROUPS_STORE_NAME,
        DB_VERSION
    );
    const groupsToFetch = groupIds.filter(
        (id) => !cachedRequirementGroups.some((group) => group.id === id)
    );

    result.requirementGroups.push(
        ...cachedRequirementGroups.filter((group) => groupIds.includes(group.id))
    );

    if (!wasmModule) {
        groupsToFetch.forEach((id) => {
            result.errors[id] = "WASM module not loaded";
        });
        return result;
    }

    const fetchPromises = groupsToFetch.map(async (id) => {
        try {
            const response = await wasmModule.get_requirement_group({ input: id });
            if (response.output) {
                const group = response.output.output;
                await saveData(
                    dbName,
                    REQUIREMENT_GROUPS_STORE_NAME,
                    [group],
                    DB_VERSION,
                    false
                );
                result.requirementGroups.push(group);
            } else if (response.error) {
                result.errors[id] = response.error.message;
            }
        } catch (err: unknown) {
            result.errors[id] = "Failed to fetch requirement group";
        }
    });

    await Promise.all(fetchPromises);
    return result;
}

