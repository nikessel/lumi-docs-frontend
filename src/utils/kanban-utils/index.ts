import { fetchUser } from "@/utils/user-utils";
import { v4 as uuidv4 } from "uuid";
import type * as WasmModule from "@wasm";
import { User, KanbanColumn, TaskStatus, Task, IdType } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { updateTaskStatus } from "../tasks-utils";

export const addKanbanColumn = async (
    wasmModule: typeof WasmModule | null,
    columnTitle: string,
    associatedTaskStatus: TaskStatus
): Promise<User | null> => {
    if (!wasmModule) {
        console.error("WASM module not provided");
        return null;
    }

    const user = await fetchUser(wasmModule);
    if (!user) return null;

    const kanbanConfig = user.task_management?.kanban;

    if (!kanbanConfig) {
        console.error("Kanban configuration not found in user data");
        return null;
    }

    const newColumn: KanbanColumn = {
        column_name: columnTitle,
        column_associated_task_status: associatedTaskStatus,
        tasks: [],
    };

    kanbanConfig.columns.push(newColumn);

    try {
        const res = await wasmModule.update_user({ input: user });
        const cacheStore = useCacheInvalidationStore.getState();
        cacheStore.addStaleId(user.id);
        cacheStore.triggerUpdate("user");
    } catch (err) {
        console.error("Error updating user:", err);
        return null;
    }

    return user;
};

export const removeKanbanColumn = async (
    wasmModule: typeof WasmModule | null,
    columnName: string
): Promise<User | null> => {
    if (!wasmModule) {
        console.error("WASM module not provided");
        return null;
    }

    const user = await fetchUser(wasmModule);

    if (!user) return null;

    const kanbanConfig = user.task_management?.kanban;

    if (!kanbanConfig) {
        console.error("Kanban configuration not found in user data");
        return null;
    }

    const updatedColumns = kanbanConfig.columns.filter(
        (column) => column.column_name !== columnName
    );

    if (updatedColumns.length === kanbanConfig.columns.length) {
        console.warn(`No column found with the name "${columnName}"`);
        return user;
    }

    kanbanConfig.columns = updatedColumns;

    try {
        await wasmModule.update_user({ input: user });
        const cacheStore = useCacheInvalidationStore.getState();
        cacheStore.addStaleId(user.id);
        cacheStore.triggerUpdate("user");
    } catch (err) {
        console.error("Error updating user:", err);
        return null;
    }

    return user;
};

export async function moveTasksToColumns(
    wasmModule: typeof WasmModule | null,
    updates: { task: Task; targetColumnName: string; newOrder?: IdType[] }[]
): Promise<boolean> {
    if (!wasmModule) {
        console.error("WASM module is required to move tasks.");
        return false;
    }

    const user = await fetchUser(wasmModule);
    if (!user) {
        console.error("User data not found.");
        return false;
    }

    const kanbanConfig = user.task_management?.kanban;

    if (!kanbanConfig) {
        console.error("Kanban configuration not found in user data.");
        return false;
    }

    try {
        const updatedColumns = [...kanbanConfig.columns]; // Clone the current columns for updates

        // Iterate over the updates to adjust task statuses and column orders
        for (const { task, targetColumnName, newOrder } of updates) {
            const targetColumn = updatedColumns.find(
                (column) => column.column_name === targetColumnName
            );

            if (!targetColumn) {
                console.error(`Target column "${targetColumnName}" not found for task "${task.title}".`);
                continue;
            }

            // Update the task status using the backend function
            await updateTaskStatus(wasmModule, task, targetColumn.column_associated_task_status);

            // Update the task list in the target column if `newOrder` is provided
            if (newOrder) {
                targetColumn.tasks = newOrder;
            } else {
                // If no specific order is provided, ensure the task is in the column
                if (!targetColumn.tasks.includes(task.id!)) {
                    targetColumn.tasks.push(task.id!);
                }
            }

            // Remove the task from all other columns
            updatedColumns.forEach((column) => {
                if (column.column_name !== targetColumnName) {
                    column.tasks = column.tasks.filter((taskId) => taskId !== task.id);
                }
            });
        }

        // Update the Kanban configuration with the modified columns
        kanbanConfig.columns = updatedColumns;

        // Update the user with the modified Kanban configuration
        await wasmModule.update_user({ input: user });

        // Invalidate the cache to reflect the updated user data
        const cacheStore = useCacheInvalidationStore.getState();
        cacheStore.addStaleId(user.id);
        cacheStore.triggerUpdate("user");
        return true;
    } catch (error) {
        console.error("Failed to move tasks to columns:", error);
        return false;
    }
}


// export async function moveTasksToColumns(
//     wasmModule: typeof WasmModule | null,
//     updates: { task: Task; targetColumnName: string }[]
// ): Promise<boolean> {
//     if (!wasmModule) {
//         console.error("WASM module is required to move tasks.");
//         return false;
//     }

//     const user = await fetchUser(wasmModule);
//     if (!user) {
//         console.error("User data not found.");
//         return false;
//     }

//     const kanbanConfig = user.task_management?.kanban;

//     if (!kanbanConfig) {
//         console.error("Kanban configuration not found in user data.");
//         return false;
//     }

//     try {
//         const updatedColumns = [...kanbanConfig.columns]; // Clone the current columns for updates

//         // Update task statuses and columns
//         for (const { task, targetColumnName } of updates) {
//             const targetColumn = updatedColumns.find(
//                 (column) => column.column_name === targetColumnName
//             );

//             if (!targetColumn) {
//                 console.error(`Target column "${targetColumnName}" not found for task "${task.title}".`);
//                 continue;
//             }

//             // Update the task status using the backend function
//             await updateTaskStatus(wasmModule, task, targetColumn.column_associated_task_status);

//             // Update the column assignments
//             updatedColumns.forEach((column) => {
//                 if (column.column_name === targetColumnName) {
//                     if (!column.tasks.includes(task.id!)) {
//                         column.tasks.push(task.id!);
//                     }
//                 } else {
//                     column.tasks = column.tasks.filter((taskId) => taskId !== task.id);
//                 }
//             });
//         }

//         // Update the Kanban configuration with the modified columns
//         kanbanConfig.columns = updatedColumns;

//         // Update the user with the modified Kanban configuration
//         await wasmModule.update_user({ input: user });

//         // Invalidate the cache to reflect the updated user data
//         const cacheStore = useCacheInvalidationStore.getState();
//         cacheStore.addStaleId(user.id);
//         cacheStore.triggerUpdate("user");

//         console.log("Tasks successfully moved to columns.");
//         return true;
//     } catch (error) {
//         console.error("Failed to move tasks to columns:", error);
//         return false;
//     }
// }


// export const updateTaskOrder = async (
//     wasmModule: typeof WasmModule | null,
//     user: User,
//     columns: KanbanColumn[],
//     sourceColumnName: string,
//     destinationColumnName: string,
//     taskId: IdType,
//     destinationIndex: number
// ): Promise<{ error: string | undefined, msg: string } | null> => {
//     if (!wasmModule) {
//         console.error("WASM module not provided");
//         return null;
//     }

//     // Clone columns to avoid mutating the original
//     const updatedColumns = columns.map((col) => ({ ...col, tasks: [...col.tasks] }));

//     const sourceColumn = updatedColumns.find((col) => col.column_name === sourceColumnName);
//     const destinationColumn = updatedColumns.find((col) => col.column_name === destinationColumnName);

//     if (!sourceColumn || !destinationColumn) {
//         console.error("Source or destination column not found");
//         return null;
//     }

//     // Remove task from source column
//     sourceColumn.tasks = sourceColumn.tasks.filter((id) => id !== taskId);

//     // Insert task into destination column at the specified index
//     destinationColumn.tasks.splice(destinationIndex, 0, taskId);

//     // Update the user's Kanban configuration
//     const updatedKanbanConfig = { ...user.task_management?.kanban, columns: updatedColumns };
//     const updatedUser: User = {
//         ...user,
//         task_management: {
//             ...user.task_management,
//             kanban: updatedKanbanConfig,
//             tags: user.task_management?.tags || [],
//             saved_views: user.task_management?.saved_views || []
//         },
//     };

//     // Send the updated user data to the backend
//     try {
//         const response = await wasmModule.update_user({ input: updatedUser });

//         if (response?.output) {
//             console.log("Task order updated successfully in the backend");
//             return { error: undefined, msg: "Task order updated successfully" };
//         } else {
//             console.error("Failed to update the backend:", response?.error?.message);
//             return { error: "Failed to update the backend:", msg: "An error occured" };

//         }
//     } catch (error) {
//         console.error("Error updating task order in the backend:", error);
//         return { error: "Failed to update the backend:", msg: "An error occured" };
//     }
// };
