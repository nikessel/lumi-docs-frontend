import { fetchUser } from "@/utils/user-utils";
import type * as WasmModule from "@wasm";
import { User, KanbanColumn, TaskStatus, Task, IdType } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { updateTaskStatus } from "../tasks-utils";

export const addKanbanColumn = async (
    wasmModule: typeof WasmModule | null,
    columnTitle: string,
    associatedTaskStatus: TaskStatus
): Promise<User | null> => {

    console.log(`📌 Adding Kanban column: [${columnTitle}]...`);

    if (!wasmModule) {
        console.error("🚫 Error: WASM module is missing.");
        return null;
    }

    const user = await fetchUser(wasmModule);
    if (!user) {
        console.error("🚫 Error: Unable to fetch user.");
        return null;
    }

    const kanbanConfig = user.task_management?.kanban;

    if (!kanbanConfig) {
        console.error("🚫 Error: Kanban configuration not found in user data.");
        return null;
    }

    const newColumn: KanbanColumn = {
        column_name: columnTitle,
        column_associated_task_status: associatedTaskStatus,
        tasks: [],
    };

    kanbanConfig.columns.push(newColumn);

    try {
        await wasmModule.update_user({ input: user });

        const cacheStore = useCacheInvalidationStore.getState();
        cacheStore.addStaleId(user.id);
        cacheStore.triggerUpdate("user");

        console.log(`📂 Kanban column [${columnTitle}] added successfully.`);
        console.log(`♻️ Cache invalidated for user [${user.id}].`);

    } catch (err) {
        console.error(`❌ Error updating user while adding column [${columnTitle}]:`, err);
        return null;
    }

    return user;
};


export const removeKanbanColumn = async (
    wasmModule: typeof WasmModule | null,
    columnName: string
): Promise<User | null> => {

    console.log(`📌 Removing Kanban column: [${columnName}]...`);

    if (!wasmModule) {
        console.error("🚫 Error: WASM module is missing.");
        return null;
    }

    const user = await fetchUser(wasmModule);
    if (!user) {
        console.error("🚫 Error: Unable to fetch user.");
        return null;
    }

    const kanbanConfig = user.task_management?.kanban;

    if (!kanbanConfig) {
        console.error("🚫 Error: Kanban configuration not found in user data.");
        return null;
    }

    const updatedColumns = kanbanConfig.columns.filter(
        (column) => column.column_name !== columnName
    );

    if (updatedColumns.length === kanbanConfig.columns.length) {
        console.warn(`⚠️ No column found with the name [${columnName}].`);
        return user;
    }

    kanbanConfig.columns = updatedColumns;

    try {
        await wasmModule.update_user({ input: user });

        const cacheStore = useCacheInvalidationStore.getState();
        cacheStore.addStaleId(user.id);
        cacheStore.triggerUpdate("user");

        console.log(`🗑️ Kanban column [${columnName}] removed successfully.`);
        console.log(`♻️ Cache invalidated for user [${user.id}].`);

    } catch (err) {
        console.error(`❌ Error updating user while removing column [${columnName}]:`, err);
        return null;
    }

    return user;
};


export async function moveTasksToColumns(
    wasmModule: typeof WasmModule | null,
    updates: { task: Task; targetColumnName: string; newOrder?: IdType[] }[]
): Promise<boolean> {

    console.log(`📌 Moving ${updates.length} tasks to columns...`);

    if (!wasmModule) {
        console.error("❌ Error: WASM module is required to move tasks.");
        return false;
    }

    const user = await fetchUser(wasmModule);
    if (!user) {
        console.error("❌ Error: User data not found.");
        return false;
    }

    const kanbanConfig = user.task_management?.kanban;

    if (!kanbanConfig) {
        console.error("❌ Error: Kanban configuration not found in user data.");
        return false;
    }

    try {
        const updatedColumns = [...kanbanConfig.columns]; // Clone columns

        for (const { task, targetColumnName, newOrder } of updates) {
            const targetColumn = updatedColumns.find(
                (column) => column.column_name === targetColumnName
            );

            if (!targetColumn) {
                console.warn(`⚠️ Target column [${targetColumnName}] not found for task [${task.title}].`);
                continue;
            }

            await updateTaskStatus(wasmModule, task, targetColumn.column_associated_task_status);

            if (newOrder) {
                targetColumn.tasks = newOrder;
            } else {
                if (!targetColumn.tasks.includes(task.id!)) {
                    targetColumn.tasks.push(task.id!);
                }
            }

            updatedColumns.forEach((column) => {
                if (column.column_name !== targetColumnName) {
                    column.tasks = column.tasks.filter((taskId) => taskId !== task.id);
                }
            });

            console.log(`🎯 Task [${task.title}] moved to column [${targetColumnName}].`);
        }

        kanbanConfig.columns = updatedColumns;
        await wasmModule.update_user({ input: user });

        const cacheStore = useCacheInvalidationStore.getState();
        cacheStore.addStaleId(user.id);
        cacheStore.triggerUpdate("user");

        console.log("✅ Tasks moved successfully.");
        console.log(`♻️ Cache invalidated for user [${user.id}].`);

        return true;
    } catch (error) {
        console.error("❌ Failed to move tasks to columns:", error);
        return false;
    }
}
