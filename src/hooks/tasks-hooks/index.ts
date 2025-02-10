import { useState, useEffect } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchTasksByReport, fetchTaskById } from "@/utils/tasks-utils";
import { Task } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useSearchParamsState } from "@/contexts/search-params-context";
import { useFilesContext } from "@/contexts/files-context";
import { useReportsContext } from "@/contexts/reports-context";
import { filterReports } from "@/utils/report-utils";
import { useRequirementsContext } from "@/contexts/requirements-context";
// import { useNewAuth } from "@/hooks/auth-hook";
import { useAuth } from "../auth-hook/Auth0Provider";


export interface TaskWithReportId extends Task {
    reportId: string;
}

interface UseTasks {
    tasks: TaskWithReportId[];
    selectedFilteredReportsTasks: Task[];
    loading: boolean;
    error: string | null;
}

export const useTasks = (): UseTasks => {
    const { wasmModule } = useWasm();
    const [tasks, setTasks] = useState<TaskWithReportId[]>([]);
    const [tasksByReportId, setTasksByReportId] = useState<Record<string, TaskWithReportId[]>>({});
    const [selectedFilteredReportsTasks, setSelectedFilteredReportsTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth()


    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["tasks"]);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
    const isBeingRefetched = useCacheInvalidationStore((state) => state.beingRefetched["tasks"]);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);
    const staleTaskIds = useCacheInvalidationStore((state) => state.staleTaskIds);
    const removeStaleTaskIds = useCacheInvalidationStore((state) => state.removeStaleTaskIds)

    const { reports, loading: reportsLoading } = useReportsContext();
    const { selectedReports, selectedTaskDocuments, searchQuery, compliance } = useSearchParamsState();
    const { requirements } = useRequirementsContext();
    const { files } = useFilesContext();

    useEffect(() => {
        const fetchAllTasks = async (isInitialLoad = false) => {

            if (!wasmModule) {
                return;
            }

            if (!isAuthenticated || authLoading) {
                return
            }

            if (!reports.length) {
                if (!reportsLoading) {
                    setLoading(false)
                }
                return;
            }

            if (!isInitialLoad && !lastUpdated) {
                return;
            }

            try {
                triggerUpdate("tasks", true);
                if (isInitialLoad) {
                    setLoading(true);
                } else {
                    console.log("🔄 Refetching tasks...");
                    setBeingRefetched("tasks", true);
                }

                let updatedTasksByReport: Record<string, TaskWithReportId[]> = { ...tasksByReportId };

                if (staleTaskIds.length > 0) {
                    // Fetch only the stale tasks by their ID
                    const updatedTasks = await Promise.all(
                        staleTaskIds.map(async taskId => {
                            try {
                                const updatedTask = await fetchTaskById(wasmModule, taskId);
                                if (!updatedTask) {
                                    console.warn(`⚠️ No task found for ID: ${taskId}`);
                                    return null;
                                }
                                return updatedTask as TaskWithReportId;
                            } catch (error) {
                                console.error(`❌ Error fetching task ID: ${taskId}`, error);
                                return null;
                            }
                        })
                    );

                    // Filter out null values
                    const validUpdatedTasks = updatedTasks.filter((task): task is TaskWithReportId => task !== null);

                    // Replace old tasks with updated ones in both tasks and tasksByReportId
                    validUpdatedTasks.forEach(updatedTask => {
                        // Find the report ID from the existing state
                        const reportId = Object.keys(tasksByReportId).find(reportId =>
                            tasksByReportId[reportId].some(task => task.id === updatedTask.id)
                        );

                        if (reportId) {
                            // Replace the task in `tasksByReportId`
                            updatedTasksByReport[reportId] = updatedTasksByReport[reportId].map(task =>
                                task.id === updatedTask.id ? updatedTask : task
                            );

                            // Replace the task in `tasks`
                            setTasks(prevTasks =>
                                prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
                            );
                        }
                    });

                    console.log(`✅ Fetched ${validUpdatedTasks.length} stale tasks: ${staleTaskIds.join(", ")}`);
                    removeStaleTaskIds(staleTaskIds); // Remove fetched stale task IDs from cache
                } else {
                    triggerUpdate("tasks", true);
                    const allTasksByReport = await Promise.all(
                        reports.map(report =>
                            fetchTasksByReport(wasmModule, report.id).then(tasks =>
                                tasks.map(task => ({ ...task, reportId: report.id }))
                            )
                        )
                    );

                    allTasksByReport.forEach((tasks, index) => {
                        updatedTasksByReport[reports[index].id] = tasks;
                    });

                    console.log(`✅ Fetched ${Object.values(updatedTasksByReport).flat().length} tasks`);
                }

                setTasks(Object.values(updatedTasksByReport).flat());
                setTasksByReportId(updatedTasksByReport);
                triggerUpdate("tasks", true);
            } catch (err: unknown) {
                console.error("❌ Error fetching tasks:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch tasks");
            } finally {
                if (isInitialLoad) {
                    setLoading(false)

                } else {
                    setLoading(false)
                    setBeingRefetched("tasks", false);
                }
                setLoading(false);
                triggerUpdate("tasks", true);
            }
        };

        fetchAllTasks(loading);
    }, [wasmModule, reports, reportsLoading, lastUpdated, staleTaskIds, loading, setBeingRefetched, triggerUpdate, isBeingRefetched, removeStaleTaskIds, tasksByReportId, authLoading, isAuthenticated]);


    console.log("TESTSTSTSTSTSTSTS", tasks)
    useEffect(() => {

        const filteredReports = filterReports(reports, selectedReports, searchQuery, compliance, requirements);
        const reportIds = filteredReports.map(report => report.id);

        let filteredTasks = reportIds.flatMap(reportId => tasksByReportId[reportId] || []);

        if (selectedTaskDocuments.length > 0) {
            filteredTasks = filteredTasks.filter(task => {
                const associatedDocId = files?.find(file => file.title === task.associated_document)?.id;
                return associatedDocId && selectedTaskDocuments.includes(associatedDocId);
            });
        }

        console.log(`✅ Filtered tasks updated: ${filteredTasks.length} tasks`);
        setSelectedFilteredReportsTasks(filteredTasks);
    }, [tasksByReportId, reports, selectedReports, searchQuery, compliance, requirements, selectedTaskDocuments, files]);

    return { tasks, selectedFilteredReportsTasks, loading, error };
};
