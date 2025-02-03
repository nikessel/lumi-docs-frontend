import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils";
import type { File } from "@wasm";
import type * as WasmModule from "@wasm";
import { dbName } from "@/utils/db-utils";
import { doesNotReject } from "assert";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

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
    const staleFileIds = useCacheInvalidationStore.getState().staleFileIds
    const clearStaleFileIds = useCacheInvalidationStore.getState().clearStaleFileIds

    // Check if cache is valid
    const isCacheExpired = lastFetchTimestamp
        ? Date.now() - lastFetchTimestamp > FILES_CACHE_TTL
        : true;

    if (cachedFiles.length > 0 && !isCacheExpired && isFullFetch && staleFileIds.length < 1) {
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
        console.log("GETTING ALL FILES")

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
            clearStaleFileIds()
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

export async function createDirectory(
    wasmModule: typeof WasmModule | null,
    title: string,
    path: string
): Promise<{ success: boolean; error: string | null }> {
    if (!wasmModule) {
        return { success: false, error: "WASM module not loaded" };
    }

    try {
        const response = wasmModule.new_file(
            {
                path: `${title}`,
                size: 0
            }
        )

        console.log("wasmModule", response)


        // const response = await wasmModule.create_file({
        //     input: {
        //         id: `folder-${Date.now()}`,
        //         title: title,
        //         is_directory: true,
        //         extension: "txt",
        //         created_date: new Date().toISOString(),
        //         size: 0,
        //         path: path,
        //         uploaded: true,
        //         multipart_upload_id: `folder-${Date.now()}`,
        //         total_chunks: 1,
        //         status: "ready",
        //         number: 0,
        //         multipart_upload_part_ids: [`folder-${Date.now()}`]
        //     }
        // });
        // console.log("create directory", response)

        if (response.error) {
            return { success: false, error: response.error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        console.error("Error creating directory:", err);
        return { success: false, error: "Failed to create directory" };
    }
}

export async function moveFile(
    wasmModule: typeof WasmModule | null,
    fileId: string,
    newPath: string
): Promise<{ success: boolean; error: string | null }> {
    if (!wasmModule) {
        return { success: false, error: "WASM module not loaded" };
    }

    try {
        const response = await wasmModule.update_directory({
            id: fileId,
            path: newPath,
        });

        console.log("movefile", response)

        if (response.error) {
            return { success: false, error: response.error.message };
        }

        // // Update the file's path in IndexedDB
        // const cachedFiles = await getData<CachedFile>(
        //     FILES_DB_NAME,
        //     FILES_STORE_NAME,
        //     FILES_DB_VERSION
        // );

        // const updatedFiles = cachedFiles.map((file) =>
        //     file.id === fileId ? { ...file, path: newPath } : file
        // );

        // await saveData(
        //     FILES_DB_NAME,
        //     FILES_STORE_NAME,
        //     updatedFiles,
        //     FILES_DB_VERSION,
        //     true
        // );

        return { success: true, error: null };
    } catch (err) {
        console.error("Error moving file:", err);
        return { success: false, error: "Failed to move file" };
    }
}

