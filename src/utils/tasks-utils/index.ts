import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils"
import type { Task } from "@wasm";
import type * as WasmModule from "@wasm";
import { dbName, dbVersion } from "@/utils/db-utils";

const TASKS_STORE_NAME = "tasks";
const TASKS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Extended type for cached reports
interface CachedTask extends Task {
    timestamp?: number;
}

export async function fetchTasksByReport(
    wasmModule: typeof WasmModule | null,
    reportId: string
): Promise<Task[]> {
    if (!wasmModule) throw new Error("WASM module not loaded");

    const cachedTasks = await getData<CachedTask>(dbName, TASKS_STORE_NAME, dbVersion);
    const cachedReportTasks = cachedTasks.filter(task => task.id === reportId);
    const isExpired = cachedReportTasks[0]?.timestamp
        ? Date.now() - cachedReportTasks[0].timestamp > TASKS_CACHE_TTL
        : true;

    if (cachedReportTasks.length > 0 && !isExpired) {
        return cachedReportTasks;
    }

    const response = await wasmModule.get_tasks_by_report({ input: reportId });

    if (response.output) {
        const tasks = response.output.output.map(task => ({
            ...task,
            timestamp: Date.now(),
        }));
        await saveData(dbName, TASKS_STORE_NAME, tasks, dbVersion);
        return tasks;
    }

    throw new Error(response.error?.message || "Failed to fetch tasks");
}

