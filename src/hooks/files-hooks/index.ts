import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchFiles } from "@/utils/files-utils";
import type { File } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useAuth } from "../auth-hook/Auth0Provider";

interface UseFiles {
    files: File[];
    isLoading: boolean;
    error: string | null;
}

export const useFiles = (): UseFiles => {
    const { wasmModule } = useWasm();
    const [files, setFiles] = useState<File[]>([]);
    const [isInitialLoad, setInitialLoad] = useState(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth()


    const addStaleFileId = useCacheInvalidationStore((state) => state.addStaleFileId);
    const removeStaleFileIds = useCacheInvalidationStore((state) => state.removeStaleFileIds);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);
    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["files"]);

    useEffect(() => {
        if (!files.length) return;

        const staleFileIds: string[] = files
            .filter((file) => file.status === "processing" || file.status === "uploading")
            .map((file) => file.id);

        if (staleFileIds.length > 0) {
            console.log(`📌 Marking ${staleFileIds.length} files as stale...`);
            staleFileIds.forEach((id) => addStaleFileId(id));

            const timeout = setTimeout(() => {
                console.log("⏳ Refreshing stale files...");
                triggerUpdate("files");
            }, 60 * 1000);

            return () => clearTimeout(timeout);
        }
    }, [files, addStaleFileId, triggerUpdate]);

    useEffect(() => {
        const loadFiles = async () => {
            if (!wasmModule) {
                return;
            }

            if (!isAuthenticated || authLoading) {
                return
            }

            if (!isInitialLoad && !lastUpdated) {
                return;
            }

            try {
                if (isInitialLoad) {
                    setIsLoading(true);
                } else {
                    setIsRefetching(true);
                }

                const { files: fetchedFiles, error } = await fetchFiles(wasmModule);

                if (error) {
                    console.error("❌ Failed to fetch files:", error);
                    setError(error);
                } else {
                    console.log(`✅ Successfully fetched ${fetchedFiles.length} files.`);
                    setFiles(fetchedFiles);
                    setError(null);
                    setInitialLoad(false);

                    const fetchedFileIds = fetchedFiles.map((file) => file.id);
                    removeStaleFileIds(fetchedFileIds);
                }
            } catch (err) {
                console.error("❌ Error loading files:", err);
                setError("Failed to load files");
            } finally {
                setIsRefetching(false);
                setIsLoading(false);
            }
        };

        loadFiles();
    }, [wasmModule, lastUpdated, isInitialLoad, removeStaleFileIds, authLoading, isAuthenticated]);

    return { files, isLoading, error };
};
