import { useEffect, useState } from "react";
import { fetchUser } from "@/utils/user-utils";
import type { User } from "@wasm";
import { useWasm } from "@/components/WasmProvider";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useAuth } from "../auth-hook/Auth0Provider";
import { logLumiDocsContext } from "@/utils/logging-utils";

interface UseUserReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export const useUser = (): UseUserReturn => {
    const { wasmModule } = useWasm();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["user"]);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {

            if (!wasmModule || !isAuthenticated || authLoading) return;

            try {
                setLoading(true);
                const fetchedUser = await fetchUser(wasmModule);

                if (fetchedUser) {
                    logLumiDocsContext(`User updated: ${fetchedUser.id}`, "success")
                    setUser(fetchedUser);
                } else {
                    logLumiDocsContext(`User data not found`, "warning")
                    setError("User data not found");
                }
            } catch (err: unknown) {
                logLumiDocsContext(`Error fetching user:`, "error")
                setError(err instanceof Error ? err.message : "Error fetching user");
            } finally {
                triggerUpdate("user", true) // when true, lastUpdated is set to null to avoid refetches
                setLoading(false);
                setHasFetchedOnce(true);
            }
        };

        if (!hasFetchedOnce || lastUpdated) {
            fetchUserData();
        }
    }, [wasmModule, isAuthenticated, authLoading, lastUpdated, hasFetchedOnce, triggerUpdate]);

    return { user, loading, error };
};
