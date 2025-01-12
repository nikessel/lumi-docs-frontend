import { fetchUser } from "@/utils/user-utils";
import type { User } from "@wasm";
import type * as WasmModule from "@wasm";
import { clearUserCache } from "@/utils/user-utils";

import { v4 as uuidv4 } from "uuid";

export const addKanbanColumn = async (
    wasmModule: typeof WasmModule | null,
    columnTitle: string
): Promise<User | null> => {
    if (!wasmModule) {
        console.error("WASM module not provided");
        return null;
    }

    console.log("FROMFUNCTION", columnTitle)

    const user = await fetchUser(wasmModule);
    if (!user) return null;

    let preferences;
    try {
        preferences = user.preferences ? JSON.parse(user.preferences) : { kanban: [] };
    } catch (err) {
        console.error("Failed to parse user.preferences:", err);
        preferences = { kanban: [] };
    }

    if (!Array.isArray(preferences.kanban)) {
        preferences.kanban = [];
    }

    const newColumn = { id: uuidv4(), title: columnTitle };
    preferences.kanban.push(newColumn);

    user.preferences = JSON.stringify(preferences);

    try {
        await wasmModule.update_user({ input: user });
        await clearUserCache();
        console.log("Kanban column added:", newColumn);
    } catch (err) {
        console.error("Error updating user:", err);
    }

    return user;
};


export const removeKanbanColumn = async (
    wasmModule: typeof WasmModule | null,
    columnId: string
): Promise<User | null> => {
    if (!wasmModule) {
        console.error("WASM module not provided");
        return null;
    }

    const user = await fetchUser(wasmModule);
    if (!user) return null;

    let preferences;
    try {
        preferences = user.preferences ? JSON.parse(user.preferences) : { kanban: [] };
    } catch (err) {
        console.error("Failed to parse user.preferences:", err);
        preferences = { kanban: [] };
    }

    if (!Array.isArray(preferences.kanban)) {
        preferences.kanban = [];
    }

    const updatedColumns = preferences.kanban.filter((col: { id: string }) => col.id !== columnId);
    if (updatedColumns.length !== preferences.kanban.length) {
        preferences.kanban = updatedColumns;

        user.preferences = JSON.stringify(preferences);

        try {
            await wasmModule.update_user({ input: user });
            await clearUserCache();
            console.log("Kanban column removed:", columnId);
        } catch (err) {
            console.error("Error updating user:", err);
        }
    }

    return user;
};
