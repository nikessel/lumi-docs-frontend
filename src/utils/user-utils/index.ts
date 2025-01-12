import type * as WasmModule from "@wasm";
import { saveData, getData } from "@/utils/db-utils";
import type { User } from "@wasm";
import { dbName, dbVersion } from "@/utils/db-utils";
import { deleteData } from "@/utils/db-utils"; // Ensure this utility exists for deleting indexedDB entries

const USER_STORE = "user";
const USER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedUser extends User {
    timestamp: number;
}

export async function fetchUser(wasmModule: typeof WasmModule | null): Promise<User | null> {
    if (!wasmModule) {
        console.error("WASM module not provided");
        return null;
    }

    const cachedUser: CachedUser[] | null = await getData<CachedUser>(dbName, USER_STORE, dbVersion);

    if (cachedUser && cachedUser.length > 0 && Date.now() - cachedUser[0].timestamp < USER_CACHE_TTL) {
        console.log("Using cached user data");
        return cachedUser[0];
    }

    try {
        const response = await wasmModule.get_user();
        if (response.output) {
            const user = response.output.output;

            if (!user.preferences) {
                user.preferences = JSON.stringify({ kanban: [] });
            }

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

export async function clearUserCache() {
    try {
        await deleteData(dbName, USER_STORE, dbVersion); // Delete user data from the cache
        console.log("User cache cleared");
    } catch (err) {
        console.error("Failed to clear user cache:", err);
    }
}

