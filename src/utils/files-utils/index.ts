import React from "react";
import type { File } from "@wasm";
import type * as WasmModule from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";


export async function fetchFiles(
    wasmModule: typeof WasmModule | null
): Promise<{ files: File[]; error: string | null }> {

    const result: { files: File[]; error: string | null } = {
        files: [],
        error: null,
    };

    const clearStaleFileIds = useCacheInvalidationStore.getState().clearStaleFileIds;

    if (!wasmModule) {
        return result;
    }

    try {
        // Fetch files from the WASM module
        const response = await wasmModule.get_all_files();

        if (response.output) {
            const filesData = response.output.output;
            result.files = filesData;
            clearStaleFileIds();
        } else if (response.error) {
            result.error = response.error.message;
            console.error(`⚠️ Fetch failed: ${response.error.message}`);
        }
    } catch (err) {
        console.error("❌ Error fetching files:", err);
        result.error = "Failed to fetch files";
        clearStaleFileIds();
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

        return { success: true, error: null };
    } catch (err) {
        console.error("Error moving file:", err);
        return { success: false, error: "Failed to move file" };
    }
}

export const fetchFileData = async (
    fileId: string,
    wasmModule: typeof WasmModule | null,
    fileData: Record<string, Uint8Array>,
    setFileData: React.Dispatch<React.SetStateAction<Record<string, Uint8Array>>>
): Promise<Uint8Array | null> => {

    console.log(`📡 Fetching file data for [${fileId}]...`);

    if (!wasmModule) {
        console.error("🚫 Error: WASM module is missing.");
        return null;
    }

    try {
        const response = await wasmModule.get_file_data({ input: fileId });

        if (response.output) {
            const data = response.output.output;
            setFileData(prev => ({ ...prev, [fileId]: data }));
            console.log(`📄 File data fetched successfully for [${fileId}]`);
            return data;
        } else if (response.error) {
            console.error(`⚠️ Fetch failed for [${fileId}]: ${response.error.message}`);
        }
    } catch (err) {
        console.error(`❌ Error fetching file data for [${fileId}]:`, err);
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

