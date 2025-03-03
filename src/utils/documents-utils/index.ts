import React from "react";
import type { Document } from "@wasm";
import type * as WasmModule from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";


export async function fetchDocuments(
    wasmModule: typeof WasmModule | null
): Promise<{ documents: Document[]; error: string | null }> {

    const result: { documents: Document[]; error: string | null } = {
        documents: [],
        error: null,
    };

    const clearStaleDocumentIds = useCacheInvalidationStore.getState().clearStaleDocumentIds;

    if (!wasmModule) {
        return result;
    }

    try {
        // Fetch documents from the WASM module
        const response = await wasmModule.get_all_documents();

        if (response.output) {
            const documentsData = response.output.output;
            result.documents = documentsData;
            clearStaleDocumentIds();
        } else if (response.error) {
            result.error = response.error.message;
            console.error(`⚠️ Fetch failed: ${response.error.message}`);
        }
    } catch (err) {
        console.error("❌ Error fetching documents:", err);
        result.error = "Failed to fetch documents";
        clearStaleDocumentIds();
    }

    return result;
}

export async function fetchDocumentsByFileIds(
    wasmModule: typeof WasmModule | null,
    fileIds: string[]
): Promise<Record<string, Document>> {
    if (!wasmModule) {
        throw new Error("WASM module not loaded");
    }
    const documentsByFileId: Record<string, Document> = {};

    await Promise.all(
        fileIds.map(async (fileId) => {
            const response = await wasmModule.get_document_by_file_id({ input: fileId });
            if (response.error) {
                console.error(`Error fetching document for fileId ${fileId}: ${response.error.message}`);
            } else if (response.output) {
                documentsByFileId[fileId] = response.output.output;
            }
        })
    );

    return documentsByFileId;
}




