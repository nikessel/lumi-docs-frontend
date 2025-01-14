import React from "react";
import { Button } from "antd";
import Typography from "@/components/typography";
import { genColor } from "@/utils/styling-utils";

interface TaskCardProps {
    title: string;
    taskCount: number;
    icon: string;
    onView: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, taskCount, icon, onView }) => {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
            {/* Icon and Title Section */}
            <div className="flex items-center">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10  rounded-full mr-3" style={{ color: genColor(title).color, backgroundColor: genColor(title).backgroundColor }}>
                    {icon}
                </div>
                {/* Title and Task Count */}
                <div>
                    <Typography textSize="h6" className="font-bold">
                        {title}
                    </Typography>
                    <Typography textSize="small" color="secondary" className="mt-1">
                        {taskCount} implementation tasks
                    </Typography>
                </div>
            </div>
            {/* View Button */}
            <Button type="link" onClick={onView} className="p-0 text-blue-500">
                View
            </Button>
        </div>
    );
};

export default TaskCard;
