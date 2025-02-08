import React from "react";
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
        clearStaleFileIds()
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

export const fetchFileData = async (
    fileId: string,
    wasmModule: typeof WasmModule | null, // Replace `any` with the correct type if available
    fileData: Record<string, Uint8Array>,
    setFileData: React.Dispatch<React.SetStateAction<Record<string, Uint8Array>>>
): Promise<Uint8Array | null> => {
    if (!wasmModule) {
        return null;
    }

    if (fileData[fileId]) {
        return fileData[fileId];
    }

    try {
        const response = await wasmModule.get_file_data({ input: fileId });

        if (response.output) {
            const data = response.output.output;
            setFileData(prev => ({ ...prev, [fileId]: data }));
            return data;
        } else if (response.error) {
            console.error(`Error fetching data for file ${fileId}:`, response.error.message);
        }
    } catch (err) {
        console.error("Error fetching file data:", err);
    }
    return null;
};


export const viewFile = async (
    fileId: string,
    fetchFileData: (fileId: string) => Promise<Uint8Array | null>,
    blobUrls: Record<string, string>,
    setBlobUrls: (callback: (prev: Record<string, string>) => Record<string, string>) => void,
    setViewLoading: (callback: (prev: Record<string, boolean>) => Record<string, boolean>) => void
) => {
    setViewLoading(prev => ({ ...prev, [fileId]: true }));

    try {
        if (blobUrls[fileId]) {
            window.open(blobUrls[fileId], "_blank", "noopener,noreferrer");
            return;
        }

        const data = await fetchFileData(fileId);
        if (data) {
            const bytes = new Uint8Array(data);
            const blob = new Blob([bytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setBlobUrls(prev => ({ ...prev, [fileId]: url }));
            window.open(url, "_blank", "noopener,noreferrer");
        }
    } finally {
        setViewLoading(prev => ({ ...prev, [fileId]: false }));
    }
};

export const downloadFile = async (
    fileId: string,
    fileName: string,
    mimeType: string,
    fetchFileData: (fileId: string) => Promise<Uint8Array | null>,
    setDownloadLoading: (callback: (prev: Record<string, boolean>) => Record<string, boolean>) => void
) => {
    setDownloadLoading(prev => ({ ...prev, [fileId]: true }));

    try {
        const data = await fetchFileData(fileId);
        if (data) {
            const bytes = new Uint8Array(data);
            const blob = new Blob([bytes], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    } finally {
        setDownloadLoading(prev => ({ ...prev, [fileId]: false }));
    }
};
