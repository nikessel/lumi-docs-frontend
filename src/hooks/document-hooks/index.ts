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
    const { files } = useFilesContext(); // Assumed hook that returns { files: File[] }
    const [documents, setDocuments] = useState<Document[]>([]);
    const [filesByDocumentId, setFilesByDocumentId] = useState<Record<string, File>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const removeStaleDocumentIds = useCacheInvalidationStore((state) => state.removeStaleDocumentIds);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);
    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["documents"]);

    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    // Fetch documents from the WASM module
    useEffect(() => {
        const loadDocuments = async () => {
            if (!wasmModule || !isAuthenticated || authLoading) return;

            try {
                setIsLoading(true);
                const { documents: fetchedDocuments, error } = await fetchDocuments(wasmModule);

                if (error) {
                    logLumiDocsContext(`Failed to fetch documents: ${error}`, "error");
                    setError(error);
                } else {
                    setDocuments(fetchedDocuments);
                    setError(null);
                    logLumiDocsContext(`Documents updated: ${fetchedDocuments.length}`, "success");
                    const fetchedDocumentIds = fetchedDocuments.map((document) => document.id);
                    removeStaleDocumentIds(fetchedDocumentIds);
                }
            } catch (err) {
                logLumiDocsContext(`Error loading documents: ${err}`, "error");
                setError("Failed to load documents");
            } finally {
                triggerUpdate("documents", true); // Reset lastUpdated
                setIsLoading(false);
                setHasFetchedOnce(true);
            }
        };

        if (!hasFetchedOnce || lastUpdated) {
            loadDocuments();
        }
    }, [wasmModule, isAuthenticated, authLoading, lastUpdated, hasFetchedOnce, removeStaleDocumentIds, triggerUpdate]);

    // New effect: When files change, fetch documents by file IDs and flip the mapping
    useEffect(() => {
        const updateFilesByDocumentId = async () => {
            if (!wasmModule || !files || files.length === 0) return;

            try {
                // Fetch documents for each fileId using the new utility
                const docsByFileId = await fetchDocumentsByFileIds(wasmModule, files.map((file) => file.id));

                // Flip the mapping: key becomes document.id, value is the corresponding file
                const newFilesByDocumentId: Record<string, File> = {};
                for (const file of files) {
                    const doc = docsByFileId[file.id];
                    if (doc) {
                        newFilesByDocumentId[doc.id] = file;
                    }
                }
                logLumiDocsContext(`Documents by file ID updated: ${newFilesByDocumentId.length}`, "success");
                setFilesByDocumentId(newFilesByDocumentId);
            } catch (err) {
                logLumiDocsContext(`Error loading documents by fileID: ${err}`, "error");
            }
        };

        updateFilesByDocumentId();
    }, [files, wasmModule]);

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
