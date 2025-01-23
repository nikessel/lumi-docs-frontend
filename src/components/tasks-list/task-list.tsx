import React, { useState } from "react";
import { Button, Input } from "antd";
import DocumentTaskCard from "./task-card";
import Typography from "@/components/typography";
import { Task } from "@wasm";
import { getDocumentIconLetters } from "@/utils/files-utils";

interface TaskListProps {
    tasks: Task[];
    isLoading: boolean;
    onViewAll: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, isLoading, onViewAll }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Group tasks by `associated_document`
    const groupedTasks = tasks.reduce((acc, task) => {
        const doc = task.associated_document || "Unassigned";
        if (!acc[doc]) {
            acc[doc] = [];
        }
        acc[doc].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    // Convert grouped tasks into an array and sort by the number of tasks
    const sortedDocuments = Object.entries(groupedTasks)
        .map(([document, tasks]) => ({
            document,
            tasks,
            taskCount: tasks.length,
        }))
        .sort((a, b) => {
            if (a.document === "Unassigned") return 1; // Move "Unassigned" to the bottom
            if (b.document === "Unassigned") return -1; // Ensure "Unassigned" stays at the bottom
            return b.taskCount - a.taskCount; // Sort by task count for other documents
        });

    // Filter documents based on search term
    const filteredDocuments = sortedDocuments.filter(({ document, tasks }) => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
            document.toLowerCase().includes(lowerSearchTerm) ||
            tasks.some((task) =>
                task.title.toLowerCase().includes(lowerSearchTerm)
            )
        );
    });

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-4 items-center mb-4">
                <Typography textSize="h3">Document Tasks</Typography>
                <Button type="link" onClick={onViewAll} className="p-0 text-blue-500">
                    View All
                </Button>
            </div>
            <Input.Search
                placeholder="Search tasks or documents..."
                style={{ marginBottom: "16px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {/* Render DocumentTaskCards */}
                {isLoading ? (
                    Array.from({ length: 20 }).map((_, index) => (
                        <DocumentTaskCard
                            key={`loading-${index}`}
                            document_title=""
                            number_of_associated_tasks={0}
                            document_icon_letters=""
                            onView={() => { }}
                            isLoading={true}
                        />
                    ))
                ) : (
                    filteredDocuments.map(({ document, tasks, taskCount }) => (
                        <DocumentTaskCard
                            key={document}
                            document_title={document}
                            number_of_associated_tasks={taskCount}
                            document_icon_letters={getDocumentIconLetters(document)}
                            onView={() => console.log(`View tasks for document: ${document}`, tasks)}
                            isLoading={false}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskList;
