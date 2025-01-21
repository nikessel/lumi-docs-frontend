import React, { createContext, useContext } from 'react';
import { useAllReportsTasks } from '@/hooks/tasks-hooks'; // Import the hook
import { Report, Task } from '@wasm';

interface AllReportsTasksContextType {
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

const AllReportsTasksContext = createContext<AllReportsTasksContextType | undefined>(undefined);

export const AllReportsTasksProvider: React.FC<{ reports: Report[]; children: React.ReactNode }> = ({ reports, children }) => {
    const { tasks, loading, error } = useAllReportsTasks(reports);

    return (
        <AllReportsTasksContext.Provider value={{ tasks, loading, error }}>
            {children}
        </AllReportsTasksContext.Provider>
    );
};

export const useAllReportsTasksContext = () => {
    const context = useContext(AllReportsTasksContext);
    if (!context) {
        throw new Error('useAllReportsTasksContext must be used within an AllReportsTasksProvider');
    }
    return context;
};
