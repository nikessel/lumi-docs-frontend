import { useState, useEffect } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchTasksByReport } from "@/utils/tasks-utils"
import { Report, Task } from "@wasm";
import { getSelectedFilteredReports } from "@/utils/report-utils";

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

    useEffect(() => {
        const fetchAllTasks = async () => {
            if (!wasmModule) return;

            try {
                setLoading(true);
                const allTasks = await Promise.all(
                    reports.map(report => fetchTasksByReport(wasmModule, report.id))
                );
                setTasks(allTasks.flat());
            } catch (err: any) {
                setError(err.message || "Failed to fetch tasks");
            } finally {
                setLoading(false);
            }
        };

        fetchAllTasks();
    }, [wasmModule, reports]);

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

    useEffect(() => {
        const fetchFilteredTasks = async () => {
            try {
                setLoading(true);
                const reports = await getSelectedFilteredReports(wasmModule);
                const filteredTasks = await Promise.all(
                    reports.map(report => fetchTasksByReport(wasmModule, report.id))
                );
                setTasks(filteredTasks.flat());
            } catch (err: any) {
                setError(err.message || "Failed to fetch filtered tasks");
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredTasks();
    }, [wasmModule]);

    return { tasks, loading, error };
};
