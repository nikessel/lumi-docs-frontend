'use client';

import React from 'react';
import TaskList from '@/components/tasks-list/task-list';
import TaskCommentList from '@/components/latest-comments/task-comment-list';
import { useTasksContext } from '@/contexts/tasks-context';

const Page: React.FC = () => {
    const { selectedFilteredReportsTasks } = useTasksContext()

    return (
        <div className="flex gap-x-12" style={{ height: "70vh" }}>
            <div style={{ width: "30%" }}>
                <TaskList tasks={selectedFilteredReportsTasks} />
            </div>
            <div style={{ width: "70%" }}>
                <TaskCommentList tasks={selectedFilteredReportsTasks} />
            </div>
        </div>
    );
};

export default Page;
