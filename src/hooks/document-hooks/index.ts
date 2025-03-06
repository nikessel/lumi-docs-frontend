import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchDocuments } from "@/utils/documents-utils";
import { fetchDocumentsByFileIds } from "@/utils/documents-utils";
import type { Document, File } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useAuth } from "../auth-hook/Auth0Provider";
import { logLumiDocsContext } from "@/utils/logging-utils";
import { useFilesContext } from "@/contexts/files-context";

interface UseDocuments {
    documents: Document[];
    filesByDocumentId: Record<string, File>;
    isLoading: boolean;
    error: string | null;
}

export const useDocuments = (): UseDocuments => {
    const { wasmModule } = useWasm();
    const { files } = useFilesContext();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [filesByDocumentId, setFilesByDocumentId] = useState<Record<string, File>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const removeStaleDocumentIds = useCacheInvalidationStore((state) => state.removeStaleDocumentIds);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);
    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["documents"]);
    const fileIdsNeedingDocuments = useCacheInvalidationStore((state) => state.fileIdsNeedingDocuments);
    const removeFileIdsNeedingDocuments = useCacheInvalidationStore((state) => state.removeFileIdsNeedingDocuments);

    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    // Fetch documents from the WASM module
    useEffect(() => {
        const loadDocuments = async () => {
            if (!wasmModule || !isAuthenticated || authLoading) return;

            try {
                setIsLoading(true);
                let fetchedDocuments: Document[] = [];

                if (fileIdsNeedingDocuments.length > 0) {
                    // Fetch documents for specific file IDs
                    const docsByFileId = await fetchDocumentsByFileIds(wasmModule, fileIdsNeedingDocuments);

                    // Convert the fileId -> document mapping to a flat array of documents
                    fetchedDocuments = Object.values(docsByFileId).filter((doc): doc is Document => doc !== null);

                    // Remove the file IDs from the list since we've fetched their documents
                    removeFileIdsNeedingDocuments(fileIdsNeedingDocuments);

                    // Update the filesByDocumentId mapping
                    const newFilesByDocumentId: Record<string, File> = {};
                    for (const fileId of fileIdsNeedingDocuments) {
                        const doc = docsByFileId[fileId];
                        const file = files.find(f => f.id === fileId);
                        if (doc && file) {
                            newFilesByDocumentId[doc.id] = file;
                        }
                    }
                    setFilesByDocumentId(prev => ({ ...prev, ...newFilesByDocumentId }));
                } else {
                    // If no specific file IDs need documents, fetch all documents
                    const { documents: allDocuments, error } = await fetchDocuments(wasmModule);

                    if (error) {
                        logLumiDocsContext(`Failed to fetch documents: ${error}`, "error");
                        setError(error);
                    } else {
                        fetchedDocuments = allDocuments;
                        setError(null);
                        logLumiDocsContext(`Documents updated: ${fetchedDocuments.length}`, "success");
                        const fetchedDocumentIds = fetchedDocuments.map((document) => document.id);
                        removeStaleDocumentIds(fetchedDocumentIds);
                    }
                }

                // Update the documents state with the new documents
                setDocuments(prev => {
                    const existingIds = new Set(prev.map(d => d.id));
                    const newDocuments = fetchedDocuments.filter(d => !existingIds.has(d.id));
                    return [...prev, ...newDocuments];
                });

            } catch (err) {
                logLumiDocsContext(`Error loading documents: ${err}`, "error");
                setError("Failed to load documents");
            } finally {
                triggerUpdate("documents", true);
                setIsLoading(false);
                setHasFetchedOnce(true);
            }
        };

        if (!hasFetchedOnce || lastUpdated || fileIdsNeedingDocuments.length > 0) {
            loadDocuments();
        }
    }, [wasmModule, isAuthenticated, authLoading, lastUpdated, hasFetchedOnce, removeStaleDocumentIds, triggerUpdate, fileIdsNeedingDocuments, removeFileIdsNeedingDocuments, files]);

    return { documents, filesByDocumentId, isLoading, error };
};


// import { useEffect, useState } from "react";
// import { useWasm } from "@/components/WasmProvider";
// import { fetchDocuments } from "@/utils/documents-utils";
// import type { Document } from "@wasm";
// import useCacheInvalidationStore from "@/stores/cache-validation-store";
// import { useAuth } from "../auth-hook/Auth0Provider";
// import { logLumiDocsContext } from "@/utils/logging-utils";

// interface UseDocuments {
//     documents: Document[];
//     isLoading: boolean;
//     error: string | null;
// }

// export const useDocuments = (): UseDocuments => {
//     const { wasmModule } = useWasm();
//     const [documents, setDocuments] = useState<Document[]>([]);
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     const [error, setError] = useState<string | null>(null);
//     const { isAuthenticated, isLoading: authLoading } = useAuth()


//     const addStaleDocumentId = useCacheInvalidationStore((state) => state.addStaleDocumentId);
//     const removeStaleDocumentIds = useCacheInvalidationStore((state) => state.removeStaleDocumentIds);
//     const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);
//     const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["documents"]);

//     const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

//     useEffect(() => {
//         const loadDocuments = async () => {
//             if (!wasmModule || !isAuthenticated || authLoading) return;

//             try {
//                 setIsLoading(true);
//                 const { documents: fecthedDocuments, error } = await fetchDocuments(wasmModule);

//                 if (error) {
//                     logLumiDocsContext(`Failed to fetch documents:  ${error}`, "error")
//                     setError(error);
//                 } else {
//                     setDocuments(fecthedDocuments);
//                     setError(null);
//                     logLumiDocsContext(`Documents updated:  ${fecthedDocuments.length}`, "success")
//                     const fetchedDocumentIds = fecthedDocuments.map((document) => document.id);
//                     removeStaleDocumentIds(fetchedDocumentIds);
//                 }
//             } catch (err) {
//                 logLumiDocsContext(`Error loading documents:  ${err}`, "error")
//                 setError("Failed to load documents");
//             } finally {
//                 triggerUpdate("documents", true); // Reset lastUpdated
//                 setIsLoading(false);
//                 setHasFetchedOnce(true);
//             }
//         };

//         if (!hasFetchedOnce || lastUpdated) {
//             loadDocuments();
//         }
//     }, [wasmModule, isAuthenticated, authLoading, lastUpdated, hasFetchedOnce, removeStaleDocumentIds, triggerUpdate]);

//     return { documents, isLoading, error };
// };
