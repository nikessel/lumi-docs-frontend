import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils";
import type { Section } from "@wasm";

import type * as WasmModule from "@wasm";

const DB_NAME = "CategoriesCacheDB";
const STORE_NAME = "categories";
const META_STORE_NAME = "meta";
const DB_VERSION = 1;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function fetchCategories(
    wasmModule: typeof WasmModule | null
): Promise<{
    categories: Section[];
    error: string | null;
}> {
    const result: {
        categories: Section[];
        error: string | null;
    } = {
        categories: [],
        error: null,
    };

    // Fetch cached categories
    const cachedCategories = await getData<Section>(DB_NAME, STORE_NAME, DB_VERSION);
    const isFullFetch = await getMetadata(DB_NAME, "fullFetch", DB_VERSION);
    const lastFetchTimestamp = await getMetadata(DB_NAME, "lastFetch", DB_VERSION);

    const isExpired = lastFetchTimestamp
        ? Date.now() - lastFetchTimestamp > CACHE_TTL
        : true;

    if (cachedCategories.length > 0 && !isExpired && isFullFetch) {
        console.log("Using cached categories data");
        result.categories = cachedCategories;
        return result;
    }

    if (!wasmModule) {
        result.error = "WASM module not loaded";
        return result;
    }

    console.log("Fetching fresh categories data");

    try {
        const response = await wasmModule.get_categories();

        if (response.output) {
            const categoriesData = response.output.output;

            // Save categories and metadata
            await saveData(DB_NAME, STORE_NAME, categoriesData, DB_VERSION, true);
            await saveMetadata(DB_NAME, "fullFetch", true, DB_VERSION);
            await saveMetadata(DB_NAME, "lastFetch", Date.now(), DB_VERSION);

            result.categories = categoriesData;
        } else if (response.error) {
            result.error = response.error.message;
        }
    } catch (err) {
        console.error("Error fetching categories:", err);
        result.error = "Failed to fetch categories";
    }

    return result;
}
