import { useEffect, useState } from "react";
import { fetchUser } from "@/utils/user-utils";
import type { User } from "@wasm";
import { useWasm } from '@/components/WasmProvider';

interface UseUserReturn {
    user: User | null;
    kanbanColumns: { id: string; title: string }[]; // Update type to match the expected structure
    loading: boolean;
    error: string | null;
}

export const useUser = (refreshTrigger: number): UseUserReturn => {
    const { wasmModule } = useWasm();
    const [user, setUser] = useState<User | null>(null);
    const [kanbanColumns, setKanbanColumns] = useState<{ id: string; title: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const loadUser = async () => {
            if (!wasmModule) {
                setError("WASM module not provided");
                setLoading(false);
                return;
            }

            try {
                const userData = await fetchUser(wasmModule);


                setUser(userData);

                if (userData?.preferences) {
                    let preferences;

                    // Parse preferences if it's a JSON string
                    if (typeof userData.preferences === "string") {
                        preferences = JSON.parse(userData.preferences);
                    } else {
                        console.warn("Unexpected preferences format, defaulting to empty preferences");
                        preferences = {};
                    }
                    console.log("refreshTrigger", preferences)


                    if (Array.isArray(preferences.kanban)) {
                        setKanbanColumns(preferences.kanban);
                    } else {
                        setKanbanColumns([]);
                    }
                } else {
                    setKanbanColumns([]);
                }
            } catch (err: any) {
                console.error("Failed to fetch user:", err.message);
                setError(err.message || "Error fetching user");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [wasmModule, refreshTrigger]);

    return { user, kanbanColumns, loading, error };
};

