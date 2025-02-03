import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchFiles } from "@/utils/files-utils";
import type { File } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

interface UseFiles {
    files: File[];
    isLoading: boolean;
    error: string | null;
}

export const useFiles = (): UseFiles => {
    const { wasmModule } = useWasm();
    const [files, setFiles] = useState<File[]>([]);
    const [isInitialLoad, setInitialLoad] = useState(true)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefetching, setIsRefetching] = useState(false)
    const [error, setError] = useState<string | null>(null);


    const addStaleFileId = useCacheInvalidationStore((state) => state.addStaleFileId)
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate)
    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["files"]);


    useEffect(() => {
        const staleFileIds: string[] = files
            .filter(file => file.status === "processing" || file.status === "uploading")
            .map(file => file.id);

        if (staleFileIds.length > 0) {
            staleFileIds.forEach(id => addStaleFileId(id));

            setTimeout(() => {
                triggerUpdate("files");
            }, 60 * 1000);
        }
    }, [files, addStaleFileId, triggerUpdate]);

    useEffect(() => {
        const loadFiles = async () => {

            if (isInitialLoad) {
                setIsLoading(true);
            } else {
                setIsRefetching(true)
            }

            try {
                const { files, error } = await fetchFiles(wasmModule);
                if (error) {
                    setError(error);
                } else {
                    setFiles(files);
                    setInitialLoad(false)
                    setError(null);
                }
            } catch (err) {
                console.error("Error loading files:", err);
                setError("Failed to load files");
            } finally {
                setIsRefetching(false)
                setIsLoading(false);
            }
        };

        if (wasmModule) {
            loadFiles();
        }
    }, [wasmModule, lastUpdated]);

    return { files, isLoading, error };
};
