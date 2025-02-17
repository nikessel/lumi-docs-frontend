import type * as WasmModule from "@wasm";
import type { User, SavedView, UserPreferences } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

export async function fetchUser(wasmModule: typeof WasmModule | null): Promise<User | null> {

    if (!wasmModule) {
        return null;
    }

    try {
        const response = await wasmModule.get_user();

        if (response.output) {
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

    if (!wasmModule) {
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

        // Update user in WASM module
        const res = await wasmModule.update_user({ input: updatedUser });

        console.log("✅ View saved successfully:", res);

        return { success: true, message: "Saved view successfully added to user preferences." };
    } catch (error) {
        console.error("❌ Error saving view to backend:", error);
        return { success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function deleteSavedView(
    wasmModule: typeof WasmModule | null,
    viewTitle: string,
    viewLink: string
): Promise<{ success: boolean; message: string }> {

    if (!wasmModule) {
        return { success: false, message: "WASM module not loaded" };
    }

    try {
        const response = await wasmModule.get_user();
        const user: User | undefined = response.output?.output;

        if (!user) {
            console.error("❌ User not found");
            return { success: false, message: "User not found" };
        }

        // Filter views by matching both title and link
        const updatedViews = user.task_management?.saved_views?.filter(
            view => view.title !== viewTitle || view.link !== viewLink
        ) || [];

        const updatedUser: User = {
            ...user,
            task_management: {
                ...user.task_management,
                saved_views: updatedViews,
                kanban: user.task_management?.kanban || { columns: [] },
                tags: user.task_management?.tags || [],
            },
        };

        const res = await wasmModule.update_user({ input: updatedUser });

        console.log("✅ View deleted successfully:", res);

        useCacheInvalidationStore.getState().addStaleId(user.id);
        useCacheInvalidationStore.getState().triggerUpdate("user");

        return { success: true, message: "Saved view successfully deleted." };
    } catch (error) {
        console.error("❌ Error deleting saved view:", error);
        return { success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` };
    }
}



export async function updateUserTourPreference(
    wasmModule: typeof WasmModule | null,
    userId: string,
    tourEnabled: boolean
): Promise<{ success: boolean; message: string }> {

    const { addStaleId } = useCacheInvalidationStore.getState();

    if (!wasmModule) {
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



