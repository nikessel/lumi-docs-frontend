// TaskTable.tsx
import React from 'react';
import { Table, Checkbox } from 'antd';
import TaskActions from './task-actions';
import { Task, TaskStatus } from "@wasm";
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
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
        } catch (error) {
            console.error(`Failed to update task ${task.id}:`, error);
        }
    };

    const filteredTasks = tasks.filter(task => task.status !== "unseen");


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
            title: 'Task',
            dataIndex: 'title',
            key: 'title',
            render: (_: unknown, record: Task) => (
                <div>
                    <div className={record.status === "ignored" ? "line-through" : ""} style={{ fontWeight: "bold" }}>
                        {record.title}
                    </div>
                    {(record.status !== "completed" && record.status !== "ignored") && (
                        <div style={{ color: "#888" }}>{record.description}</div>
                    )}
                </div>
            ),
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
            dataSource={filteredTasks}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
        />
    );
};

export default TaskTable;
