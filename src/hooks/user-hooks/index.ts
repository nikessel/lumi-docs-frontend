import { useEffect, useState } from "react";
import { fetchUser } from "@/utils/user-utils";
import type { User } from "@wasm";
import { useWasm } from "@/components/WasmProvider";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useAuth } from "../auth-hook/Auth0Provider";

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
                    console.log(`🟢 lumi-docs-context user updated: ${fetchedUser.id}`);
                    setUser(fetchedUser);
                } else {
                    console.warn("⚠️ User data not found");
                    setError("User data not found");
                }
            } catch (err: unknown) {
                console.error("❌ Error fetching user:", err);
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


// import { useEffect, useState } from "react";
// import { fetchUser } from "@/utils/user-utils";
// import type { User } from "@wasm";
// import { useWasm } from '@/components/WasmProvider';
// import useCacheInvalidationStore from "@/stores/cache-validation-store";
// import { useAuth } from "../auth-hook/Auth0Provider";

// interface UseUserReturn {
//     user: User | null;
//     loading: boolean;
//     error: string | null;
// }

// interface UseUserReturn {
//     user: User | null;
//     loading: boolean;
//     error: string | null;
// }

// export const useUser = (): UseUserReturn => {
//     const { wasmModule } = useWasm();
//     const [user, setUser] = useState<User | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     // const { isAuthenticated, isLoading: authLoading } = useNewAuth()
//     const { isAuthenticated, isLoading: authLoading } = useAuth()

//     const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["user"]);
//     const beingRefetched = useCacheInvalidationStore((state) => state.beingRefetched["user"]);

//     const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
//     const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

//     useEffect(() => {
//         const fetchUserData = async (isInitialLoad = false) => {
//             if (!isAuthenticated || authLoading) {
//                 return
//             }

//             if (!wasmModule) {
//                 return;
//             }

//             if (isInitialLoad || lastUpdated) {
//                 try {
//                     setLoading(true)
//                     if (isInitialLoad) {
//                         setLoading(true);
//                     } else {
//                         setBeingRefetched("user", true);
//                     }

//                     const fetchedUser = await fetchUser(wasmModule);

//                     if (fetchedUser) {
//                         console.log(`✅ fetched user: ${fetchedUser.id}`);

//                         if (typeof fetchedUser.preferences === "string") {
//                             try {
//                                 fetchedUser.preferences = JSON.parse(fetchedUser.preferences);
//                             } catch {
//                                 console.warn("⚠️ Failed to parse user preferences, using raw value:", fetchedUser.preferences);
//                             }
//                         }
//                         triggerUpdate("user", true)
//                         setUser(fetchedUser);
//                     } else {
//                         console.warn("⚠️ User data not found");
//                         setError("User data not found");
//                     }
//                 } catch (err: unknown) {
//                     console.error("❌ Error fetching user:", err);
//                     setError(err instanceof Error ? err.message : "Error fetching user");
//                 } finally {
//                     if (isInitialLoad) {
//                         setLoading(false);
//                     } else if (beingRefetched) {
//                         setBeingRefetched("user", false);
//                     }
//                 }
//             }
//         };

//         fetchUserData(loading);
//     }, [wasmModule, lastUpdated, loading, setBeingRefetched, triggerUpdate, beingRefetched, isAuthenticated, authLoading]);

//     return { user, loading, error };
// };


