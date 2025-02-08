import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils"
import type { Task, TaskStatus, UpdateTaskResponse, UpdateTaskInput } from "@wasm";
import type * as WasmModule from "@wasm";
import { dbName, dbVersion } from "@/utils/db-utils";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

const TASKS_STORE_NAME = "tasks";
const TASKS_CACHE_TTL = 60 * 60 * 1000; // 5 minutes

// Extended type for cached reports
interface CachedTask extends Task {
    reportId: string,
    timestamp?: number;
}

export async function fetchTasksByReport(
    wasmModule: typeof WasmModule | null,
    reportId: string
): Promise<Task[]> {
    if (!wasmModule) throw new Error("WASM module not loaded");

    const { staleIds } = useCacheInvalidationStore.getState();

    const cachedTasks = await getData<CachedTask>(dbName, TASKS_STORE_NAME, dbVersion);
    const cachedReportTasks = cachedTasks.filter(task => task.reportId === reportId);
    const cachedTaskIds = cachedReportTasks.map((task) => task.id);
    const hasStaleIds = cachedTaskIds
        .filter((id): id is string => id !== undefined)
        .some(id => staleIds.includes(id));

    const isExpired = cachedReportTasks[0]?.timestamp
        ? Date.now() - cachedReportTasks[0].timestamp > TASKS_CACHE_TTL
        : true;

    if (cachedReportTasks.length > 0 && !isExpired && !hasStaleIds) {
        return cachedReportTasks;
    }

    const response = await wasmModule.get_tasks_by_report({ input: reportId });

    if (response.output) {
        const tasks = response.output.output.map(task => ({
            ...task,
            reportId,
            timestamp: Date.now(),
        }));

        await saveData(dbName, TASKS_STORE_NAME, tasks, dbVersion);

        return tasks;
    }

    throw new Error(response.error?.message || "Failed to fetch tasks");
}

type TaskAnalysisResult = {
    tasksByDocument: Record<string, Task[]>; // Map of document titles with associated tasks
    totalTasks: number; // Total number of tasks
    tasksByStatus: Record<string, number>; // Number of tasks for each status (e.g., "open", "completed", "ignored")
};

/**
 * Analyzes tasks and provides a summary.
 * @param tasks - Array of Task objects to analyze
 * @returns Task analysis result
 */
export const analyzeTasks = (tasks: Task[]): TaskAnalysisResult => {
    const tasksByDocument: Record<string, Task[]> = {};
    const tasksByStatus: Record<string, number> = {
        open: 0,
        completed: 0,
        ignored: 0,
    };

    tasks.forEach((task) => {
        // Group tasks by associated document
        const document = task.associated_document || 'Unassigned';
        if (!tasksByDocument[document]) {
            tasksByDocument[document] = [];
        }
        tasksByDocument[document].push(task);

        // Count tasks by status
        const status = task.status as keyof typeof tasksByStatus; // Narrow the type to known statuses
        if (status && tasksByStatus[status] !== undefined) {
            tasksByStatus[status]++;
        }
    });

    return {
        tasksByDocument,
        totalTasks: tasks.length,
        tasksByStatus,
    };
};

export async function updateTaskStatus(
    wasmModule: typeof WasmModule | null,
    task: Task,
    newStatus: TaskStatus
): Promise<UpdateTaskResponse> {
    if (!wasmModule) {
        throw new Error("WASM module is required to update the task status.");
    }

    if (!task.id) {
        throw new Error("Task ID is required to update the task status.");
    }

    // Create an updated task object with the new status
    const updatedTask: Task = {
        ...task,
        status: newStatus,
    };

    // Prepare the input for the backend update function
    const input: UpdateTaskInput = {
        input: updatedTask,
    };

    try {
        // Call the backend function to update the task
        const response = await wasmModule.update_task(input);
        const cacheStore = useCacheInvalidationStore.getState();
        if (updatedTask?.id) {
            cacheStore.addStaleId(updatedTask.id);
            cacheStore.triggerUpdate("tasks");
        }
        return response;
    } catch (error) {
        console.error("Failed to update task status:", error);
        throw new Error("Error updating task status.");
    }
}

export async function updateTask(
    wasmModule: typeof WasmModule | null,
    task: Task,
    updates: Partial<Task>
): Promise<UpdateTaskResponse> {
    if (!wasmModule) {
        throw new Error("WASM module is required to update the task.");
    }

    if (!task.id) {
        throw new Error("Task ID is required to update the task.");
    }

    // Create an updated task object by merging the original task with the updates
    const updatedTask: Task = {
        ...task,
        ...updates,
    };

    // Prepare the input for the backend update function
    const input: UpdateTaskInput = {
        input: updatedTask,
    };

    try {
        // Call the backend function to update the task
        const response = await wasmModule.update_task(input);

        // Invalidate cache for the updated task
        const cacheStore = useCacheInvalidationStore.getState();

        if (updatedTask?.id) {
            cacheStore.addStaleId(updatedTask.id);
            cacheStore.triggerUpdate("tasks");
        }

        return response;
    } catch (error) {
        console.error("Failed to update task:", error);
        throw new Error("Error updating task.");
    }
}

