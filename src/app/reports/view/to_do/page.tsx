'use client';

import React from 'react';
import TaskTable from './task-table';
import { useTasksContext } from '@/contexts/tasks-context';

const Page: React.FC = () => {
    const { selectedFilteredReportsTasks, loading: tasksLoading } = useTasksContext();


    return (
        <div >
            <TaskTable
                tasks={selectedFilteredReportsTasks}
            />
        </div>
    );
};

export default Page;
