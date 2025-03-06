import React, { useState, useEffect } from "react";
import { Input } from "antd";
import TaskCard from "./task-card";
import Typography from "@/components/typography";
import { Task } from "@wasm";
import { useFilesContext } from "@/contexts/files-context";
import { useReportsContext } from "@/contexts/reports-context";
import { TaskWithReportId } from "@/hooks/tasks-hooks";

interface TaskListProps {
    tasks: TaskWithReportId[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const { files, isLoading: filesLoading } = useFilesContext();
    const { reports } = useReportsContext();
    const [allReportIds, setAllReportIds] = useState<string[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<TaskWithReportId[]>([]);

    useEffect(() => {
        const reportIds = reports.map(report => report.id);
        setAllReportIds(reportIds);
    }, [reports]);

    useEffect(() => {
        if (filesLoading) return;

        // Filter tasks that are in todo (status === "open")
        const todoTasks = tasks.filter(task => task.status === "open");

        // Filter tasks based on search term if one exists
        const filtered = searchTerm
            ? todoTasks.filter(task =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.associated_document?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
            )
            : todoTasks;

        setFilteredTasks(filtered);
    }, [files, filesLoading, tasks, searchTerm]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-4 items-center mb-4">
                <Typography textSize="h3">Todo Tasks</Typography>
            </div>
            <Input.Search
                placeholder="Search tasks..."
                style={{ marginBottom: "16px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {filteredTasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        isLoading={false}
                        allReportIds={allReportIds}
                    />
                ))}
            </div>
        </div>
    );
};

export default TaskList;
