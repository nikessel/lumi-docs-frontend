'use client';

import React from 'react';
import TaskList from '@/components/tasks-list/task-list';
import { useSelectedFilteredReportsTasksContext } from '@/contexts/tasks-context/selected-filtered-report-tasks';
import TaskCommentList from '@/components/latest-comments/task-comment-list';

const Page: React.FC = () => {
    const { tasks, loading, error } = useSelectedFilteredReportsTasksContext()

    return (
        <div className="flex gap-x-12" style={{ height: "70vh" }}>
            <div style={{ width: "30%" }}>
                <TaskList tasks={tasks} onViewAll={() => { }} isLoading={loading} />
            </div>
            <div style={{ width: "70%" }}>
                <TaskCommentList tasks={tasks} />
            </div>
        </div>
    );
};

export default Page;
