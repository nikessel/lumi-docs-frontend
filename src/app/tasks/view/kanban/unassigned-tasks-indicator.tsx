import React, { useState, useEffect } from "react";
import { Button, Modal, Badge, Typography, Select, Table, message } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Task } from "@wasm";
import { KanbanColumn } from "@wasm";
import { moveTasksToColumns } from "@/utils/kanban-utils";
import { useWasm } from "@/components/WasmProvider";

interface UnassignedTasksIndicatorProps {
    tasks: Task[];
    kanbanColumns: KanbanColumn[];
}

const UnassignedTasksIndicator: React.FC<UnassignedTasksIndicatorProps> = ({ tasks, kanbanColumns }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [taskColumnMapping, setTaskColumnMapping] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { wasmModule } = useWasm();
    const [messageApi, contextHolder] = message.useMessage();

    const assignedTaskIds = kanbanColumns.flatMap((column) => column.tasks);
    const unassignedTasks = tasks.filter((task) => !assignedTaskIds.includes(task.id || ""));

    const autoAssignableTasks = unassignedTasks.map((task) => {
        const matchingColumns = kanbanColumns.filter(
            (column) => column.column_associated_task_status === task.status
        );

        const isAutoAssignable = matchingColumns.length > 0 && !taskColumnMapping[task.id!];
        const defaultColumn = matchingColumns[0]?.column_name || "";

        return {
            task,
            matchingColumns,
            isAutoAssignable,
            defaultColumn,
        };
    });

    const [assignableTasks, setAssignableTasks] = useState<number>(0);

    useEffect(() => {
        const countAssignableTasks = () => {
            let count = 0;
            unassignedTasks.forEach((task) => {
                const taskHasMapping = Boolean(taskColumnMapping[task.id!]);
                const taskIsAutoAssignable = kanbanColumns.some(
                    (column) => column.column_associated_task_status === task.status
                );

                if (taskHasMapping || taskIsAutoAssignable) {
                    count++;
                }
            });
            setAssignableTasks(count);
        };

        countAssignableTasks();
    }, [taskColumnMapping, tasks, kanbanColumns]);

    const handleOpenModal = () => setIsModalVisible(true);
    const handleCloseModal = () => setIsModalVisible(false);

    const handleColumnChange = (taskId: string, columnName: string) => {
        setTaskColumnMapping((prev) => ({
            ...prev,
            [taskId]: columnName,
        }));
    };

    const handleAssignTasks = async () => {
        if (!wasmModule) return;

        setLoading(true);
        try {
            const updates = autoAssignableTasks.map(({ task, defaultColumn }) => ({
                task,
                targetColumnName: taskColumnMapping[task.id!] || defaultColumn,
            }));

            const success = await moveTasksToColumns(wasmModule, updates);

            if (success) {
                messageApi.success("All tasks successfully assigned.");
                setTaskColumnMapping((prev) => ({}));
            } else {
                messageApi.error("Some tasks failed to assign. Please try again.");
            }
        } catch (error) {
            console.error("Error while assigning tasks:", error);
            messageApi.error("Failed to assign tasks. Please try again.");
        } finally {
            setLoading(false);
            handleCloseModal();
        }
    };

    const columns = [
        {
            title: "Task Title",
            dataIndex: "title",
            key: "title",
            render: (_: any, { task }: any) => <Typography.Text>{task.title}</Typography.Text>,
        },
        {
            title: "Auto-Assigned",
            dataIndex: "isAutoAssignable",
            key: "isAutoAssignable",
            render: (_: any, { isAutoAssignable }: any) =>
                isAutoAssignable ? (
                    <CheckCircleOutlined style={{ color: "green" }} />
                ) : (
                    <Typography.Text>---</Typography.Text>
                ),
        },
        {
            title: "Select Column",
            dataIndex: "matchingColumns",
            key: "matchingColumns",
            render: (_: any, { task, defaultColumn }: any) => (
                <Select
                    value={taskColumnMapping[task.id!] || defaultColumn}
                    onChange={(value) => handleColumnChange(task.id!, value)}
                    style={{ width: "200px" }}
                >
                    {kanbanColumns.map((column) => (
                        <Select.Option
                            key={column.column_name}
                            value={column.column_name}
                            style={{
                                fontWeight:
                                    column.column_associated_task_status === task.status
                                        ? "bold"
                                        : "normal",
                            }}
                        >
                            {column.column_name}
                        </Select.Option>
                    ))}
                </Select>
            ),
        },
    ];

    console.log("dafyuq", taskColumnMapping)

    return (
        <div style={{ margin: "16px" }}>
            {/* Button at the top */}
            {unassignedTasks.length > 0 ? <Button
                type="primary"
                onClick={handleOpenModal}
                style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}
            >
                Unassigned Tasks
                <Badge count={unassignedTasks.length} />
            </Button> : ""}

            {/* Modal */}
            <Modal
                title="Unassigned Tasks"
                visible={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button
                        key="assign"
                        type="primary"
                        loading={loading}
                        onClick={handleAssignTasks}
                    >
                        Assign {assignableTasks} tasks
                    </Button>,
                ]}
                style={{ top: 20, maxWidth: "900px" }}
                width="80%"
            >
                {contextHolder}
                <Table
                    dataSource={autoAssignableTasks}
                    columns={columns}
                    pagination={false}
                    rowKey={(record) => record.task.id || ""}
                    bordered
                    size="small"
                />
            </Modal>
        </div>
    );
};

export default UnassignedTasksIndicator;
