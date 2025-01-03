import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils";
import type { Section } from "@wasm";

import type * as WasmModule from "@wasm";

const DB_NAME = "SectionsCacheDB";
const STORE_NAME = "sections";
const DB_VERSION = 1;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function fetchSections(
    wasmModule: typeof WasmModule | null
): Promise<{
    sections: Section[];
    error: string | null;
}> {
    const result: {
        sections: Section[];
        error: string | null;
    } = {
        sections: [],
        error: null,
    };

    // Fetch cached sections
    const cachedSections = await getData<Section>(DB_NAME, STORE_NAME, DB_VERSION);
    const isFullFetch = await getMetadata(DB_NAME, "fullFetch", DB_VERSION);
    const lastFetchTimestamp = await getMetadata(DB_NAME, "lastFetch", DB_VERSION);

    const isExpired = lastFetchTimestamp
        ? Date.now() - lastFetchTimestamp > CACHE_TTL
        : true;

    if (cachedSections.length > 0 && !isExpired && isFullFetch) {
        console.log("Using cached sections data");
        result.sections = cachedSections;
        return result;
    }

    if (!wasmModule) {
        result.error = "WASM module not loaded";
        return result;
    }

    console.log("Fetching refreshing sections data");

    try {
        const response = await wasmModule.get_all_sections();

        if (response.output) {
            const sectionsData = response.output.output;

            // Save sections and metadata
            await saveData(DB_NAME, STORE_NAME, sectionsData, DB_VERSION, true);
            await saveMetadata(DB_NAME, "fullFetch", true, DB_VERSION);
            await saveMetadata(DB_NAME, "lastFetch", Date.now(), DB_VERSION);

            result.sections = sectionsData;
        } else if (response.error) {
            result.error = response.error.message;
        }
    } catch (err) {
        console.error("Error fetching sections:", err);
        result.error = "Failed to fetch sections";
    }

    return result;
}
