import type * as WasmModule from "@wasm";
import { saveData, getData } from "@/utils/db-utils";
import type { User, SavedView, UpdateUserInput } from "@wasm";
import { dbName, dbVersion } from "@/utils/db-utils";
import { deleteData } from "@/utils/db-utils"; // Ensure this utility exists for deleting indexedDB entries
import useCacheInvalidationStore from "@/stores/cache-validation-store";

const USER_STORE = "user";
const USER_CACHE_TTL = 60 * 60 * 1000; // 5 minutes

interface CachedUser extends User {
    timestamp: number;
}

export async function fetchUser(wasmModule: typeof WasmModule | null): Promise<User | null> {
    if (!wasmModule) {
        console.error("WASM module not provided");
        return null;
    }

    const { staleIds, removeStaleIds } = useCacheInvalidationStore.getState();

    const cachedUser: CachedUser[] | null = await getData<CachedUser>(dbName, USER_STORE, dbVersion);
    const isStale = staleIds.indexOf(cachedUser[0]?.id) > -1;

    if (cachedUser && cachedUser.length > 0 && Date.now() - cachedUser[0].timestamp < USER_CACHE_TTL && !isStale) {
        return cachedUser[0];
    }

    try {
        const response = await wasmModule.get_user();
        if (response.output) {
            const user = response.output.output;

            await saveData(dbName, USER_STORE, [{ ...user, timestamp: Date.now() }], dbVersion, true);

            return user;
        } else if (response.error) {
            console.error("Error fetching user:", response.error.message);
        }
    } catch (err) {
        console.error("Unexpected error fetching user:", err);
    }

    return null;
}

export async function saveViewToUser(
    wasmModule: typeof WasmModule | null,
    savedView: SavedView
): Promise<{ success: boolean; message: string }> {
    if (!wasmModule) {
        return { success: false, message: "WASM module not loaded" };
    }

    try {
        // Fetch the current user data
        const response = await wasmModule.get_user();
        const user: User | undefined = response.output?.output;

        if (!user) {
            return { success: false, message: "User not found" };
        }

        const updatedTaskManagement = {
            ...user.task_management,
            saved_views: [...(user.task_management?.saved_views || []), savedView],
            kanban: user.task_management?.kanban || { columns: [] },
            tags: user.task_management?.tags || [],
        };

        const updatedUser: User = {
            ...user,
            task_management: updatedTaskManagement,
        };

        await wasmModule.update_user({ input: updatedUser });

        return { success: true, message: "Saved view successfully added to user preferences." };
    } catch (error) {
        console.error("Error saving view to backend:", error);
        return { success: false, message: `Error: ${error}` };
    }
}


