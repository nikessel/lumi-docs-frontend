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
    const beingRefetched = useCacheInvalidationStore((state) => state.beingRefetched["user"]);

    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    useEffect(() => {
        const fetchUserData = async (isInitialLoad = false) => {
            console.log(`📌 Fetching user data... (Initial Load: ${isInitialLoad})`);

            if (!wasmModule) {
                console.error("❌ WASM module not provided");
                setError("WASM module not provided");
                setLoading(false);
                return;
            }

            if (isInitialLoad || lastUpdated) {
                try {
                    if (isInitialLoad) {
                        console.log("🔄 Initial user fetch started...");
                        setLoading(true);
                    } else {
                        console.log("🔄 Refetching user data...");
                        setBeingRefetched("user", true);
                    }

                    const fetchedUser = await fetchUser(wasmModule);

                    if (fetchedUser) {
                        console.log(`✅ User fetched successfully (ID: ${fetchedUser.id})`);

                        // Parse preferences if needed
                        if (typeof fetchedUser.preferences === "string") {
                            try {
                                fetchedUser.preferences = JSON.parse(fetchedUser.preferences);
                            } catch {
                                console.warn("⚠️ Failed to parse user preferences, using raw value:", fetchedUser.preferences);
                            }
                        }
                        triggerUpdate("user", true)
                        setUser(fetchedUser);
                    } else {
                        console.warn("⚠️ User data not found");
                        setError("User data not found");
                    }
                } catch (err: unknown) {
                    console.error("❌ Error fetching user:", err);
                    setError(err instanceof Error ? err.message : "Error fetching user");
                } finally {
                    if (isInitialLoad) {
                        console.log("✅ Initial user fetch completed");
                        setLoading(false);
                    } else if (beingRefetched) {
                        console.log("✅ User refetch completed");
                        setBeingRefetched("user", false);
                    }
                }
            } else {
                console.log("🟢 User data is already fetched and up to date");
            }
        };

        fetchUserData(loading);
    }, [wasmModule, lastUpdated, loading, setBeingRefetched, triggerUpdate, beingRefetched]);

    return { user, loading, error };
};


