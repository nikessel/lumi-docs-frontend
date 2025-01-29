import { useState, useEffect } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchTasksByReport } from "@/utils/tasks-utils"
import { Report, Task } from "@wasm";
import { getSelectedFilteredReports } from "@/utils/report-utils";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useSearchParamsState } from "@/contexts/search-params-context";
import { filter } from "jszip";
import { useFilesContext } from "@/contexts/files-context";
import { useFilteredRequirementsContext } from '@/contexts/requirement-context/filtered-report-requirement-context';
import { useSelectedFilteredReports } from "../report-hooks";

interface UseAllReportsTasks {
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

export const useAllReportsTasks = (reports: Report[]): UseAllReportsTasks => {
    const { wasmModule } = useWasm();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["tasks"]);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);

    useEffect(() => {
        const fetchAllTasks = async (isInitialLoad = false) => {
            if (!wasmModule) return;

            try {
                if (isInitialLoad) {
                    setLoading(true); // Set loading for the initial fetch
                } else {
                    setBeingRefetched("tasks", true); // Set refetching for subsequent fetches
                }

                const allTasks = await Promise.all(
                    reports.map(report => fetchTasksByReport(wasmModule, report.id))
                );
                setTasks(allTasks.flat());
            } catch (err: any) {
                setError(err.message || "Failed to fetch tasks");
            } finally {
                if (isInitialLoad) {
                    setLoading(false);
                } else {
                    setBeingRefetched("tasks", false);
                }
            }
        };

        fetchAllTasks(loading);
    }, [wasmModule, reports, lastUpdated]);

    return { tasks, loading, error };
};

interface UseSelectedFilteredReportsTasks {
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

export const useSelectedFilteredReportsTasks = (): UseSelectedFilteredReportsTasks => {
    const { wasmModule } = useWasm();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["tasks"]);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
    const { selectedReports, selectedTaskDocuments, searchQuery, compliance } = useSearchParamsState()
    const { files, isLoading: filesLoading } = useFilesContext()
    const { requirements, loading: requirementsLoading } = useFilteredRequirementsContext()

    useEffect(() => {
        const fetchFilteredTasks = async (isInitialLoad = false) => {
            if (!wasmModule || filesLoading || requirementsLoading) return;

            try {
                if (isInitialLoad) {
                    setLoading(true); // Set loading for the initial fetch
                } else {
                    setBeingRefetched("filteredTasks", true); // Set refetching for subsequent fetches
                }

                const reports = await getSelectedFilteredReports(wasmModule, selectedReports, searchQuery, compliance, requirements);

                let allTasks = await Promise.all(
                    reports.map(report => fetchTasksByReport(wasmModule, report.id))
                );

                let flattenedTasks = allTasks.flat();

                if (selectedTaskDocuments.length > 0) {
                    flattenedTasks = flattenedTasks.filter(task => {
                        const AscDocId = files?.find((file) => file.title === task.associated_document)?.id
                        return AscDocId && selectedTaskDocuments.includes(AscDocId)
                    });

                }

                setTasks(flattenedTasks);
            } catch (err: any) {
                setError(err.message || "Failed to fetch filtered tasks");
            } finally {
                if (isInitialLoad) {
                    setLoading(false);
                } else {
                    setBeingRefetched("filteredTasks", false);
                }
            }
        };

        fetchFilteredTasks(loading);
    }, [wasmModule, lastUpdated, selectedReports, selectedTaskDocuments, files, requirements]);

    return { tasks, loading, error };
};
