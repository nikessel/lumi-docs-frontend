import React from "react";
import { Tag } from "antd";
import { TaskStatus } from "@wasm";

interface TaskStatusTagProps {
    status: TaskStatus | undefined;
}

const TaskStatusTag: React.FC<TaskStatusTagProps> = ({ status }) => {
    if (!status) return null

    // Define the styles and colors for each status
    const statusColors: Record<TaskStatus, string> = {
        completed: "green",
        open: "blue",
        ignored: "red",
    };

    return (
        <Tag color={statusColors[status] || "default"} style={{ fontSize: "12px" }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
    );
};

export default TaskStatusTag;
