import React from 'react';
import TaskCommentCard from './task-comment-card';
import { Task } from '@wasm';
import { Button } from 'antd';
import Typography from '../typography';

interface TaskCommentListProps {
    tasks: Task[];
}

const TaskCommentList: React.FC<TaskCommentListProps> = ({ tasks }) => {
    // Filter tasks to include only those with defined comments and sort by the latest comment date
    const tasksWithLatestComments = tasks
        .filter((task) => task.comments?.length) // Ensure the task has comments
        .map((task) => ({
            ...task,
            latestCommentDate: new Date(
                Math.max(...(task.comments?.map((comment) => new Date(comment.created_date).getTime()) || [0]))
            ),
        }))
        .sort((a, b) => b.latestCommentDate.getTime() - a.latestCommentDate.getTime());

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-4 items-center mb-4">
                <Typography textSize="h3">Latest Comments</Typography>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {tasksWithLatestComments.map((task) => (
                    <TaskCommentCard key={task.id} task={task} />
                ))}
            </div>
        </div>

    );
};

export default TaskCommentList;
