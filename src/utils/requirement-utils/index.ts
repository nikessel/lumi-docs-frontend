import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils";
import type { Requirement } from "@wasm";
import type * as WasmModule from "@wasm";
import { dbName, dbVersion } from "@/utils/db-utils";

const REQUIREMENTS_STORE_NAME = "requirements";
const DB_VERSION = dbVersion;
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchRequirementsByIds(
    wasmModule: typeof WasmModule | null,
    requirementIds: string[]
): Promise<{ requirements: Requirement[]; errors: { [id: string]: string } }> {
    const result: { requirements: Requirement[]; errors: { [id: string]: string } } = {
        requirements: [],
        errors: {},
    };

    const cachedRequirements = await getData<Requirement>(dbName, REQUIREMENTS_STORE_NAME, DB_VERSION);
    const requirementsToFetch = requirementIds.filter(
        (id) => !cachedRequirements.some((requirement) => requirement.id === id)
    );

    result.requirements.push(...cachedRequirements.filter((req) => requirementIds.includes(req.id)));

    if (!wasmModule) {
        requirementsToFetch.forEach((id) => {
            result.errors[id] = "WASM module not loaded";
        });
        return result;
    }

    const fetchPromises = requirementsToFetch.map(async (id) => {
        try {
            const response = await wasmModule.get_requirement({ input: id });
            if (response.output) {
                const requirement = response.output.output;
                await saveData(dbName, REQUIREMENTS_STORE_NAME, [requirement], DB_VERSION, false);
                result.requirements.push(requirement);
            } else if (response.error) {
                result.errors[id] = response.error.message;
            }
        } catch (err: unknown) {
            result.errors[id] = "Failed to fetch requirement";
        }
    });

    await Promise.all(fetchPromises);
    return result;
}

