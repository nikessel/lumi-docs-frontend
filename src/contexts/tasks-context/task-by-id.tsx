// import React, { createContext, useContext } from "react";
// import { Task } from "@wasm";
// import { useTaskById } from "@/hooks/tasks-hooks";

// interface TaskByIdContextProps {
//     task: Task | null;
//     loading: boolean;
//     error: string | null;
// }

// const TaskByIdContext = createContext<TaskByIdContextProps | null>(null);

// export const TaskByIdProvider: React.FC<{ taskId: string; children: React.ReactNode }> = ({ taskId, children }) => {
//     const { task, loading, error } = useTaskById(taskId);

//     return (
//         <TaskByIdContext.Provider value={{ task, loading, error }}>
//             {children}
//         </TaskByIdContext.Provider>
//     );
// };

// export const useTaskByIdContext = (): TaskByIdContextProps => {
//     const context = useContext(TaskByIdContext);
//     if (!context) {
//         throw new Error("useTaskByIdContext must be used within a TaskByIdProvider");
//     }
//     return context;
// };
