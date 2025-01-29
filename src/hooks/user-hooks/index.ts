import { useEffect, useState } from "react";
import { fetchUser } from "@/utils/user-utils";
import type { User } from "@wasm";
import { useWasm } from '@/components/WasmProvider';
import useCacheInvalidationStore from "@/stores/cache-validation-store";

interface UseUserReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export const useUser = (): UseUserReturn => {
    const { wasmModule } = useWasm();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["user"]);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);

    useEffect(() => {
        const fetchUserData = async (isInitialLoad = false) => {
            if (!wasmModule) {
                setError("WASM module not provided");
                setLoading(false);
                return;
            }

            try {
                if (isInitialLoad) {
                    setLoading(true); // Set loading for the initial fetch
                } else {
                    setBeingRefetched("user", true); // Set refetching state
                }
                const fetchedUser = await fetchUser(wasmModule);

                if (fetchedUser) {
                    // Parse preferences if they exist and are a string
                    if (typeof fetchedUser.preferences === "string") {
                        try {
                            fetchedUser.preferences = JSON.parse(fetchedUser.preferences);
                        } catch (parseError) {
                            console.warn("Failed to parse user preferences, using raw value:", fetchedUser.preferences);
                        }
                    }
                    setUser(fetchedUser);
                } else {
                    setError("User data not found");
                }
            } catch (err: any) {
                console.error("Failed to fetch user:", err.message);
                setError(err.message || "Error fetching user");
            } finally {
                if (isInitialLoad) {
                    setLoading(false); // Clear loading state for the initial fetch
                } else {
                    setBeingRefetched("user", false); // Clear refetching state
                }
            }
        };

        fetchUserData(loading); // Initial fetch
    }, [wasmModule, lastUpdated]);

    return { user, loading, error };
};

