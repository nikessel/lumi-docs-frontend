import React, { createContext, useContext } from 'react';
import { useTasks } from '@/hooks/tasks-hooks'; // Import the hook
import { Task } from '@wasm';
import { TaskWithReportId } from '@/hooks/tasks-hooks';

interface TasksContextType {
    tasks: TaskWithReportId[];
    selectedFilteredReportsTasks: Task[],
    loading: boolean;
    error: string | null;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { tasks, selectedFilteredReportsTasks, loading, error } = useTasks();

    return (
        <TasksContext.Provider value={{ tasks, selectedFilteredReportsTasks, loading, error }}>
            {children}
        </TasksContext.Provider>
    );
};

export const useTasksContext = () => {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error('TasksContext must be used within an TasksProvider');
    }
    return context;
};
