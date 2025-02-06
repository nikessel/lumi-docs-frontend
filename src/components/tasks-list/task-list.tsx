import React, { useState, useEffect } from "react";
import { Button, Input, Card } from "antd";
import DocumentTaskCard from "./task-card";
import Typography from "@/components/typography";
import { Task } from "@wasm";
import { getDocumentIconLetters } from "@/utils/files-utils";
import { useFilesContext } from "@/contexts/files-context";

interface TaskListProps {
    tasks: Task[];
    isLoading: boolean;
    onViewAll: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, isLoading, onViewAll }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const { files, isLoading: filesLoading } = useFilesContext()
    const [sortedDocuments, setSortedDocuments] = useState<{
        document: string;
        tasks: Task[];
        taskCount: number;
        document_id: string | null;
    }[]>([]);

    useEffect(() => {
        if (filesLoading) return; // Wait until files are loaded

        const groupedTasks = tasks.reduce((acc, task) => {
            const doc = task.associated_document || "Unassigned";
            if (!acc[doc]) acc[doc] = [];
            acc[doc].push(task);
            return acc;
        }, {} as Record<string, Task[]>);

        const sorted = Object.entries(groupedTasks)
            .map(([document, tasks]) => ({
                document,
                tasks,
                taskCount: tasks.length,
                document_id: files.find((file) => file.title === document)?.id || null
            }))
            .sort((a, b) => b.taskCount - a.taskCount);

        setSortedDocuments(sorted);

    }, [files, filesLoading, tasks]);

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex gap-4 items-center mb-4">
                    <Typography textSize="h3">Document Tasks</Typography>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center h-full">
                    <Typography textSize="small" color="secondary">
                        Tasks are automatically generated when you create reports
                    </Typography>
                </div>

            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-4 items-center mb-4">
                <Typography textSize="h3">Document Tasks</Typography>

            </div>
            <Input.Search
                placeholder="Search tasks or documents..."
                style={{ marginBottom: "16px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {sortedDocuments.map(({ document, tasks, document_id, taskCount }) => (
                    <DocumentTaskCard
                        key={document}
                        document_title={document}
                        number_of_associated_tasks={taskCount}
                        document_icon_letters={getDocumentIconLetters(document)}
                        isLoading={false}
                        document_id={document_id}
                    />
                ))}
            </div>
        </div>
    );
};

export default TaskList;
