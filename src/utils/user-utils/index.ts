import type * as WasmModule from "@wasm";
import type { User, SavedView, UserPreferences } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

export async function fetchUser(wasmModule: typeof WasmModule | null): Promise<User | null> {
    console.log("📌 Fetching user...");

    if (!wasmModule) {
        console.error("❌ WASM module not provided");
        return null;
    }

    try {
        const response = await wasmModule.get_user();

        if (response.output) {
            console.log("✅ User fetched successfully.");
            return response.output.output;
        } else if (response.error) {
            console.error("❌ Error fetching user:", response.error.message);
        }
    } catch (err) {
        console.error("❌ Unexpected error fetching user:", err);
    }

    return null;
}

export async function saveViewToUser(
    wasmModule: typeof WasmModule | null,
    savedView: SavedView
): Promise<{ success: boolean; message: string }> {
    console.log("📌 Saving view to user...");

    if (!wasmModule) {
        console.error("❌ WASM module not loaded");
        return { success: false, message: "WASM module not loaded" };
    }

    try {
        // Fetch the current user data
        const response = await wasmModule.get_user();
        const user: User | undefined = response.output?.output;

        if (!user) {
            console.error("❌ User not found");
            return { success: false, message: "User not found" };
        }

        // Update task management preferences
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

        console.log("🔄 Updating user with new view preferences:", updatedUser);

        // Update user in WASM module
        const res = await wasmModule.update_user({ input: updatedUser });

        console.log("✅ View saved successfully:", res);

        return { success: true, message: "Saved view successfully added to user preferences." };
    } catch (error) {
        console.error("❌ Error saving view to backend:", error);
        return { success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` };
    }
}


export async function updateUserTourPreference(
    wasmModule: typeof WasmModule | null,
    userId: string,
    tourEnabled: boolean
): Promise<{ success: boolean; message: string }> {
    console.log(`📌 Updating user tour preference for user: ${userId}...`);

    const { addStaleId } = useCacheInvalidationStore.getState();

    if (!wasmModule) {
        console.error("❌ WASM module not loaded");
        return { success: false, message: "WASM module not loaded" };
    }

    try {
        // Fetch the current user data
        const response = await wasmModule.get_user();
        const user: User | undefined = response.output?.output;

        if (!user) {
            console.error("❌ User not found");
            return { success: false, message: "User not found" };
        }

        addStaleId(user.id);

        console.log(`🔄 Updating tour preference: ${tourEnabled}`);

        // Ensure all required preferences properties are set correctly
        const updatedPreferences: UserPreferences = {
            compliance_rating_acceptance_threshold: user.preferences?.compliance_rating_acceptance_threshold ?? 0, // Default value if missing
            auto_transfer_tasks: user.preferences?.auto_transfer_tasks ?? false, // Default if missing
            tour_enabled: tourEnabled, // Update only this value
        };

        const updatedUser: User = {
            ...user,
            preferences: updatedPreferences,
        };

        await wasmModule.update_user({ input: updatedUser });

        console.log("✅ Tour preference updated successfully.");

        return { success: true, message: "Tour preference updated successfully." };
    } catch (error) {
        console.error("❌ Error updating tour preference:", error);
        return { success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` };
    }
}



