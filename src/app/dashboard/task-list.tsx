import React from "react";
import { Button, Input } from "antd";
import TaskCard from "./task-card";
import Typography from "@/components/typography";

interface TaskListProps {
    tasks: {
        title: string;
        taskCount: number;
        icon: string;
    }[];
    onViewAll: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onViewAll }) => {
    return (
        <div>
            <div className="flex gap-4 items-center mb-4">
                <Typography textSize="h3">
                    Document Tasks
                </Typography>
                <Button type="link" onClick={onViewAll} className="p-0 text-blue-500">
                    View All
                </Button>
            </div>
            <Input.Search placeholder="Search tasks..." style={{ marginBottom: "16px" }} />
            {tasks.map((task, index) => (
                <TaskCard
                    key={index}
                    title={task.title}
                    taskCount={task.taskCount}
                    icon={task.icon}
                    onView={() => console.log(`Viewing task: ${task.title}`)}
                />
            ))}
        </div>
    );
};

export default TaskList;
