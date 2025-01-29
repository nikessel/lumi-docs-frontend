import React, { createContext, useContext } from 'react';
import { Task } from '@wasm';
import { useSelectedFilteredReportsTasks } from '@/hooks/tasks-hooks';

interface SelectedFilteredReportsTasksContextType {
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

const SelectedFilteredReportsTasksContext = createContext<SelectedFilteredReportsTasksContextType | undefined>(undefined);

export const SelectedFilteredReportsTasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { tasks, loading, error } = useSelectedFilteredReportsTasks();

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
