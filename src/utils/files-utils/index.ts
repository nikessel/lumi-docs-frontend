import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils";
import type { File } from "@wasm";
import type * as WasmModule from "@wasm";
import { dbName } from "@/utils/db-utils";

const FILES_DB_NAME = dbName;
const FILES_STORE_NAME = "files";
const FILES_DB_VERSION = 1;
const FILES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CachedFile extends File {
    timestamp?: number;
}

export async function fetchFiles(
    wasmModule: typeof WasmModule | null
): Promise<{ files: File[]; error: string | null }> {
    const result: { files: File[]; error: string | null } = {
        files: [],
        error: null,
    };

    // Fetch cached files from IndexedDB
    const cachedFiles = await getData<CachedFile>(FILES_DB_NAME, FILES_STORE_NAME, FILES_DB_VERSION);
    const lastFetchTimestamp = await getMetadata(FILES_DB_NAME, "lastFetch", FILES_DB_VERSION);
    const isFullFetch = await getMetadata(FILES_DB_NAME, "fullFetch", FILES_DB_VERSION);

    // Check if cache is valid
    const isCacheExpired = lastFetchTimestamp
        ? Date.now() - lastFetchTimestamp > FILES_CACHE_TTL
        : true;

    if (cachedFiles.length > 0 && !isCacheExpired && isFullFetch) {
        result.files = cachedFiles;
        return result;
    }

    if (!wasmModule) {
        result.error = "WASM module not loaded";
        return result;
    }

    try {
        // Fetch files from the WASM module
        const response = await wasmModule.get_all_files();

        if (response.output) {
            const filesData = response.output.output;

            // Add timestamps to each file for cache invalidation
            const filesWithTimestamps = filesData.map((file: File) => ({
                ...file,
                timestamp: Date.now(),
            }));

            // Save files and metadata to IndexedDB
            await saveData(FILES_DB_NAME, FILES_STORE_NAME, filesWithTimestamps, FILES_DB_VERSION, true);
            await saveMetadata(FILES_DB_NAME, "fullFetch", true, FILES_DB_VERSION);
            await saveMetadata(FILES_DB_NAME, "lastFetch", Date.now(), FILES_DB_VERSION);

            result.files = filesData;
        } else if (response.error) {
            result.error = response.error.message;
        }
    } catch (err) {
        console.error("Error fetching files:", err);
        result.error = "Failed to fetch files";
    }

    return result;
}

export const getDocumentIconLetters = (title: string) =>
    title
        .split(" ")
        .slice(0, 3) // Take up to the first three words
        .map((word) => word.charAt(0).toUpperCase()) // Take the first letter of each word
        .join("");