import React from "react";
import { Tag } from "antd";
import { TaskStatus } from "@wasm";

interface TaskStatusTagProps {
    status: TaskStatus | undefined;
}

const TaskStatusTag: React.FC<TaskStatusTagProps> = ({ status }) => {
    if (!status) return null

    const statusColors: Record<TaskStatus, string> = {
        completed: "green",
        open: "blue",
        ignored: "red",
        unseen: "gray",
    };

    return (
        <Tag color={statusColors[status] || "default"} style={{ fontSize: "12px" }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
    );
};

export default TaskStatusTag;
