import type { Task, TaskStatus, UpdateTaskResponse, UpdateTaskInput, GetTasksByReportAndRequirementInput, GetTasksByReportAndRequirementResponse } from "@wasm";
import type * as WasmModule from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { fetchWrapper } from "@/utils/error-handling-utils/fetchWrapper";

export async function fetchTasksByReport(
    wasmModule: typeof WasmModule | null,
    reportId: string
): Promise<Task[]> {


    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        throw new Error("WASM module not loaded");
    }

    try {
        const response = await wasmModule.get_tasks_by_report({ input: reportId });

        if (response.output) {
            const tasks = response.output.output.map(task => ({
                ...task,
                reportId,
            }));

            return tasks;
        } else {
            return []
        }

    } catch (error) {
        console.error(`❌ Error fetching tasks for report ID: ${reportId}:`, error);
        return []
    }
}

export async function fetchTaskById(
    wasmModule: typeof WasmModule | null,
    taskId: string
): Promise<Task | null> {

    if (!wasmModule) {
        throw new Error("WASM module not loaded");
    }

    try {
        const response = await wasmModule.get_task({ input: taskId });

        if (response.output) {
            return response.output.output;
        }

        console.warn(`⚠️ No task found for ID: ${taskId}`);
        return null;
    } catch (error) {
        console.error(`❌ Error fetching task ID: ${taskId}`, error);
        throw new Error(`Failed to fetch task for ID: ${taskId}`);
    }
}

type TaskAnalysisResult = {
    tasksByDocument: Record<string, Task[]>; // Map of document titles with associated tasks
    totalTasks: number; // Total number of tasks
    tasksByStatus: Record<string, number>; // Number of tasks for each status (e.g., "open", "completed", "ignored")
};

export const analyzeTasks = (tasks: Task[]): TaskAnalysisResult => {
    const tasksByDocument: Record<string, Task[]> = {};
    const tasksByStatus: Record<string, number> = {
        open: 0,
        completed: 0,
        ignored: 0,
    };

    tasks.forEach((task) => {
        const document = task.associated_document || 'Unassigned';
        if (!tasksByDocument[document]) {
            tasksByDocument[document] = [];
        }
        tasksByDocument[document].push(task);

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
        console.error("❌ WASM module is required to update the task status.");
        throw new Error("WASM module is required to update the task status.");
    }

    if (!task.id) {
        console.error("❌ Task ID is required to update the task status.");
        throw new Error("Task ID is required to update the task status.");
    }

    const updatedTask: Task = {
        ...task,
        status: newStatus,
    };

    const input: UpdateTaskInput = {
        input: updatedTask,
    };

    try {
        const response = await wasmModule.update_task(input);

        const cacheStore = useCacheInvalidationStore.getState();

        if (updatedTask.id) {
            cacheStore.addStaleTaskId(updatedTask.id);
            cacheStore.triggerUpdate("tasks");
        }

        console.log(`✅ Successfully updated Task ID: ${task.id} to "${newStatus}".`);
        return response;
    } catch (error) {
        console.error(`❌ Failed to update Task ID: ${task.id}:`, error);
        throw new Error("Error updating task status.");
    }
}

export async function updateTask(
    wasmModule: typeof WasmModule | null,
    task: Task,
    updates: Partial<Task>
): Promise<UpdateTaskResponse> {
    console.log(`📌 Updating Task ID: ${task.id} with changes:`, updates);

    if (!wasmModule) {
        console.error("❌ WASM module is required to update the task.");
        throw new Error("WASM module is required to update the task.");
    }

    if (!task.id) {
        console.error("❌ Task ID is required to update the task.");
        throw new Error("Task ID is required to update the task.");
    }

    const updatedTask: Task = {
        ...task,
        ...updates,
    };

    const input: UpdateTaskInput = {
        input: updatedTask,
    };

    try {
        const response = await wasmModule.update_task(input);

        const cacheStore = useCacheInvalidationStore.getState();

        if (updatedTask?.id) {
            cacheStore.addStaleTaskId(updatedTask.id);
            cacheStore.triggerUpdate("tasks");
        }

        console.log(`✅ Successfully updated Task ID: ${task.id}`);
        return response;
    } catch (error) {
        console.error(`❌ Failed to update Task ID: ${task.id}`, error);
        throw new Error("Error updating task.");
    }
}

export async function getTasksByReportAndRequirmentId(
    wasmModule: typeof WasmModule | null,
    input: GetTasksByReportAndRequirementInput
): Promise<Task[]> {
    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        throw new Error("WASM module is required to fetch tasks.");
    }

    try {
        console.log(`📌 Fetching tasks for Report ID: ${input.report_id} and Requirement ID: ${input.requirement_id}`);

        const response: GetTasksByReportAndRequirementResponse = await wasmModule.get_tasks_by_report_and_requirement({
            report_id: input.report_id, requirement_id: input.requirement_id,
        });

        if (response.output && Array.isArray(response.output.output)) {
            console.log(`✅ Fetched ${response.output.output.length} tasks for the provided report and requirement.`);
            return response.output.output;
        }

        throw new Error(response.error?.message || "Failed to fetch tasks.");
    } catch (error) {
        console.error(`❌ Error fetching tasks for report: ${input.report_id} and requirement: ${input.requirement_id}`, error);
        throw new Error(`Failed to fetch tasks for Report ${input.report_id} and Requirement ${input.requirement_id}`);
    }
}


