import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchFiles } from "@/utils/files-utils";
import type { File } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useAuth } from "../auth-hook/Auth0Provider";
import { logLumiDocsContext } from "@/utils/logging-utils";

interface UseFiles {
    files: File[];
    isLoading: boolean;
    error: string | null;
}

export const useFiles = (): UseFiles => {
    const { wasmModule } = useWasm();
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth()


    const addStaleFileId = useCacheInvalidationStore((state) => state.addStaleFileId);
    const removeStaleFileIds = useCacheInvalidationStore((state) => state.removeStaleFileIds);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);
    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["files"]);

    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    useEffect(() => {
        if (!files.length) return;

        const staleFileIds: string[] = files
            .filter((file) => file.status === "processing" || file.status === "uploading")
            .map((file) => file.id);

        if (staleFileIds.length > 0) {
            staleFileIds.forEach((id) => addStaleFileId(id));

            const timeout = setTimeout(() => {
                triggerUpdate("files");
            }, 2 * 1000);

            return () => clearTimeout(timeout);
        }
    }, [files, addStaleFileId, triggerUpdate]);

    useEffect(() => {
        const loadFiles = async () => {
            if (!wasmModule || !isAuthenticated || authLoading) return;

            try {
                setIsLoading(true);
                const { files: fetchedFiles, error } = await fetchFiles(wasmModule);

                if (error) {
                    logLumiDocsContext(`Failed to fetch files:  ${error}`, "error")
                    setError(error);
                } else {
                    setFiles(fetchedFiles);
                    setError(null);
                    logLumiDocsContext(`Files updated:  ${fetchedFiles.length}`, "success")
                    const fetchedFileIds = fetchedFiles.map((file) => file.id);
                    removeStaleFileIds(fetchedFileIds);
                }
            } catch (err) {
                logLumiDocsContext(`Error loading files:  ${err}`, "error")
                setError("Failed to load files");
            } finally {
                triggerUpdate("files", true); // Reset lastUpdated
                setIsLoading(false);
                setHasFetchedOnce(true);
            }
        };

        if (!hasFetchedOnce || lastUpdated) {
            loadFiles();
        }
    }, [wasmModule, isAuthenticated, authLoading, lastUpdated, hasFetchedOnce, removeStaleFileIds, triggerUpdate]);

    return { files, isLoading, error };
};
