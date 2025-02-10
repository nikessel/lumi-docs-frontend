import React, { useState, useEffect } from "react";
import { Input } from "antd";
import DocumentTaskCard from "./task-card";
import Typography from "@/components/typography";
import { Task } from "@wasm";
import { getDocumentIconLetters } from "@/utils/files-utils";
import { useFilesContext } from "@/contexts/files-context";
import { useReportsContext } from "@/contexts/reports-context";

interface TaskListProps {
    tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const { files, isLoading: filesLoading } = useFilesContext()
    const [sortedDocuments, setSortedDocuments] = useState<{
        document: string;
        tasks: Task[];
        taskCount: number;
        document_id: string | null;
    }[]>([]);

    const { reports } = useReportsContext()

    const [allReportIds, setAllReportIds] = useState<string[]>([]);

    useEffect(() => {
        const reportIds = reports.map(report => report.id);
        setAllReportIds(reportIds);
    }, [reports]);


    useEffect(() => {
        if (filesLoading) return;

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
                {sortedDocuments.map(({ document, document_id, taskCount }) => (
                    <DocumentTaskCard
                        key={document}
                        document_title={document}
                        number_of_associated_tasks={taskCount}
                        document_icon_letters={getDocumentIconLetters(document)}
                        isLoading={false}
                        document_id={document_id}
                        allReportIds={allReportIds}
                    />
                ))}
            </div>
        </div>
    );
};

export default TaskList;
