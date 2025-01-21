import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWasm } from '@/components/WasmProvider';
import { fetchTasksByReport } from '@/utils/tasks-utils';
import { Report, Task } from '@wasm';
import { getSelectedFilteredReports } from '@/utils/report-utils';

interface SelectedFilteredReportsTasksContextType {
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

const SelectedFilteredReportsTasksContext = createContext<SelectedFilteredReportsTasksContextType | undefined>(undefined);

export const SelectedFilteredReportsTasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { wasmModule } = useWasm();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFilteredTasks = async () => {
            if (!wasmModule) return;

            try {
                setLoading(true);
                const reports = await getSelectedFilteredReports(wasmModule);
                const filteredTasks = await Promise.all(
                    reports.map(report => fetchTasksByReport(wasmModule, report.id))
                );
                setTasks(filteredTasks.flat());
            } catch (err: any) {
                setError(err.message || 'Failed to fetch filtered tasks');
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredTasks();
    }, [wasmModule]);

    return (
        <SelectedFilteredReportsTasksContext.Provider value={{ tasks, loading, error }}>
            {children}
        </SelectedFilteredReportsTasksContext.Provider>
    );
};

export const useSelectedFilteredReportsTasksContext = () => {
    const context = useContext(SelectedFilteredReportsTasksContext);
    if (!context) {
        throw new Error('useSelectedFilteredReportsTasksContext must be used within a SelectedFilteredReportsTasksProvider');
    }
    return context;
};
