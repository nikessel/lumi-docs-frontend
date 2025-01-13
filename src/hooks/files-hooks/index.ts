import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchFiles } from "@/utils/files-utils";
import type { File } from "@wasm";

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

    useEffect(() => {
        const loadFiles = async () => {
            setIsLoading(true);
            try {
                const { files, error } = await fetchFiles(wasmModule);
                if (error) {
                    setError(error);
                } else {
                    setFiles(files);
                    setError(null);
                }
            } catch (err) {
                console.error("Error loading files:", err);
                setError("Failed to load files");
            } finally {
                setIsLoading(false);
            }
        };

        if (wasmModule) {
            loadFiles();
        }
    }, [wasmModule]);

    return { files, isLoading, error };
};
