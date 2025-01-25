import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Select, message } from 'antd';
import CustomCard from "./custom-card";
import ColumnHeader from './column-header';
import { useUserContext } from "@/contexts/user-context";
import { ControlledBoard, moveCard, KanbanBoard as KanbanBoardType, Card, OnDragEndNotification } from '@caldwell619/react-kanban';
import { removeKanbanColumn, addKanbanColumn } from '@/utils/kanban-utils';
import { useWasm } from '@/components/WasmProvider';
import { KanbanConfig, TaskStatus } from '@wasm';
import Typography from '@/components/typography';
import AddColumnSection from './add-column-component';
import DefaultSetupComponent from './create-default-setup';
import { useSelectedFilteredReportsTasksContext } from '@/contexts/tasks-context/selected-filtered-report-tasks';
import UnassignedTasksIndicator from "./unassigned-tasks-indicator";
import { moveTasksToColumns } from "@/utils/kanban-utils";

export interface KanbanBoardState {
    columns: Array<{
        id: string;
        title: string;
        cards: Array<{
            id: string;
            title: string;
            description: string;
        }>;
    }>;
}

const KanbanBoard: React.FC = () => {
    const { user, loading, error } = useUserContext();
    const { tasks, loading: tasksLoading, error: tasksError } = useSelectedFilteredReportsTasksContext();

    const [board, setBoard] = useState<KanbanBoardState | null>(null);
    const { wasmModule } = useWasm();

    const [newColumnName, setNewColumnName] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);

    const [messageApi, contextHolder] = message.useMessage(); // Initialize message API
    const [showDefaultSetup, setShowDefaultSetup] = useState(false);

    const [settingUpBoard, setSettingUpBoard] = useState(false);

    useEffect(() => {
        if (user?.task_management?.kanban?.columns && user.task_management.kanban.columns.length > 0) {
            // Map user kanban columns to board state
            setSettingUpBoard(true)
            const mappedColumns = user.task_management.kanban.columns.map((column) => ({
                id: column.column_name,
                title: column.column_name,
                cards: column.tasks.map((taskId) => ({
                    id: taskId,
                    title: `Task ${taskId}`, // Replace with actual task details when available
                    description: `Details for task ${taskId}`, // Replace with actual task details
                })),
            }));
            setBoard({ columns: mappedColumns });
            setSettingUpBoard(false)
        } else {
            setShowDefaultSetup(true)
        }
    }, [user]);

    const handleDefaultSetup = async () => {
        if (!wasmModule) return;

        const defaultColumns = [
            { column_name: 'Backlog', column_associated_task_status: 'open' },
            { column_name: 'Doing', column_associated_task_status: 'open' },
            { column_name: 'Done', column_associated_task_status: 'completed' },
            { column_name: 'Ignored', column_associated_task_status: 'ignored' },
        ];

        try {
            for (const column of defaultColumns) {
                await addKanbanColumn(
                    wasmModule,
                    column.column_name,
                    column.column_associated_task_status as TaskStatus
                );
            }
            messageApi.success('Default setup created successfully');
            setShowDefaultSetup(false); // Hide the default setup component
        } catch (err) {
            messageApi.error('Failed to create default setup');
        }
    };

    const handleCustomSetup = () => {
        setShowDefaultSetup(false); // Hide the default setup component and show an empty board
    };

    const handleAddColumn = async () => {
        if (!newColumnName.trim() || !selectedStatus) {
            messageApi.warning("Please provide a column name and select a task status.");
            return;
        }

        // Check for uniqueness of the column name
        const existingColumnNames = user?.task_management?.kanban?.columns.map((col) => col.column_name) || [];
        if (existingColumnNames.includes(newColumnName.trim())) {
            messageApi.error(`Column name "${newColumnName}" already exists. Please choose a different name.`);
            return;
        }

        try {
            const updatedUser = await addKanbanColumn(wasmModule, newColumnName.trim(), selectedStatus);
            if (updatedUser) {
                messageApi.success(`Column "${newColumnName}" added successfully`);
                setNewColumnName("");
                setSelectedStatus(null);
            }
        } catch (err) {
            messageApi.error("Failed to add column");
        }
    };

    if (loading) return <p>Loading Kanban board...</p>;
    if (error) return <p>Error loading Kanban board: {error}</p>;
    if (settingUpBoard) return <p>Setting up Kanban board...</p>;

    return (
        <div>

            <div className="flex">
                {contextHolder}

                {showDefaultSetup ?
                    <DefaultSetupComponent
                        onCustomSetup={handleCustomSetup}
                        onDefaultSetup={handleDefaultSetup}
                    />
                    :
                    board ? <div>
                        <UnassignedTasksIndicator
                            tasks={tasks}
                            kanbanColumns={user?.task_management?.kanban?.columns || []}
                        />
                        <ControlledBoard
                            // onCardDragEnd={(card, source, destination) => {
                            //     setBoard((prevBoard) => (prevBoard ? moveCard(prevBoard, source, destination) : null));
                            // }}

                            onCardDragEnd={async (card, source, destination) => {
                                if (!destination || !source) {
                                    console.warn("Invalid source or destination. Dragging operation cancelled.");
                                    return; // Do nothing if source or destination is undefined
                                }

                                setBoard((prevBoard) => (prevBoard ? moveCard(prevBoard, source, destination) : null));

                                if (!wasmModule || !user?.task_management?.kanban?.columns) {
                                    console.error("WASM module or user data is not available.");
                                    return;
                                }

                                const taskToUpdate = tasks.find((task) => task.id === card.id);

                                if (!taskToUpdate) {
                                    console.error(`Task with ID "${card.id}" not found.`);
                                    return;
                                }

                                try {
                                    const sourceColumn = user.task_management.kanban.columns.find(
                                        (col) => col.column_name === String(source.fromColumnId)
                                    );
                                    const destinationColumn = user.task_management.kanban.columns.find(
                                        (col) => col.column_name === String(destination.toColumnId)
                                    );

                                    if (!sourceColumn || !destinationColumn) {
                                        console.error("Source or destination column not found.");
                                        return;
                                    }

                                    // Calculate the new order for the destination column
                                    const newOrder = [...destinationColumn.tasks];
                                    const destinationIndex = destination.toPosition ?? newOrder.length; // Use `toPosition` or append to the end if undefined
                                    newOrder.splice(destinationIndex, 0, card.id); // Insert the task at the new position

                                    // Call moveTasksToColumns with the new order
                                    const success = await moveTasksToColumns(wasmModule, [
                                        {
                                            task: taskToUpdate,
                                            targetColumnName: String(destination.toColumnId),
                                            newOrder,
                                        },
                                    ]);

                                    if (success) {
                                        console.log(`Task "${card.title}" moved successfully to "${destination.toColumnId}".`);
                                    } else {
                                        message.error(`Failed to move task "${card.title}".`);
                                    }
                                } catch (error) {
                                    console.error("Error moving task:", error);
                                    message.error("Failed to update the backend for the moved task.");
                                }
                            }}

                            renderCard={(card) => (
                                <CustomCard task={tasks.find((task) => task.id === card.id)} /> // Pass the entire task object to the card
                            )}
                            renderColumnHeader={(column) => (
                                <ColumnHeader
                                    title={column.title}
                                    cardsCount={column.cards.length}
                                    removeColumn={() => removeKanbanColumn(wasmModule, column.title)}
                                />
                            )}
                            allowAddCard={false}
                        // renderColumnAdder={() => <AddColumnSection
                        //     newColumnName={newColumnName}
                        //     setNewColumnName={setNewColumnName}
                        //     selectedStatus={selectedStatus}
                        //     setSelectedStatus={setSelectedStatus}
                        //     handleAddColumn={handleAddColumn}
                        // />}
                        >
                            {board}
                        </ControlledBoard></div> : ""}

            </div>
        </div>
    );
};

export default KanbanBoard;
