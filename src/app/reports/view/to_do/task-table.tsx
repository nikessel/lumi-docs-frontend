// TaskTable.tsx
import React from 'react';
import { Table, Checkbox } from 'antd';
import TaskActions from './task-actions';
import { Task, TaskStatus } from "@wasm";
import { useWasm } from '@/components/WasmProvider';
import { updateTaskStatus } from '@/utils/tasks-utils';

interface TaskTableProps {
    tasks: Task[];
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
    const { wasmModule } = useWasm();

    const handleStatusChange = async (task: Task, completed: boolean) => {
        const newStatus: TaskStatus = completed ? "completed" : "open";
        try {
            await updateTaskStatus(wasmModule, task, newStatus);
            console.log(`Status updated for task ${task.id} to ${newStatus}`);
        } catch (error) {
            console.error(`Failed to update task ${task.id}:`, error);
        }
    };

    const columns = [
        {
            title: '', // Checkbox column
            dataIndex: 'completed',
            key: 'completed',
            render: (_: unknown, record: Task) => (
                <Checkbox
                    checked={record.status === "completed"}
                    onChange={(e) => handleStatusChange(record, e.target.checked)}
                />
            ),
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            render: (_: unknown, record: Task) => (
                <TaskActions task={record} />
            ),
        },
    ];

    return (
        <Table
            dataSource={tasks}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
        />
    );
};

export default TaskTable;
