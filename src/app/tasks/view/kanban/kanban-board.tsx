import React, { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import CustomCard from "./custom-card";
import ColumnHeader from './column-header';
import { useUserContext } from "@/contexts/user-context";
import { ControlledBoard, moveCard } from '@caldwell619/react-kanban';
import { removeKanbanColumn, addKanbanColumn } from '@/utils/kanban-utils';
import { useWasm } from '@/components/WasmProvider';
import { TaskStatus } from '@wasm';
import DefaultSetupComponent from './create-default-setup';
import UnassignedTasksIndicator from "./unassigned-tasks-indicator";
import { moveTasksToColumns } from "@/utils/kanban-utils";
import { useTasksContext } from '@/contexts/tasks-context';

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
    const { user, loading: userLoading } = useUserContext();
    const { selectedFilteredReportsTasks, loading: tasksLoading } = useTasksContext();

    const [board, setBoard] = useState<KanbanBoardState | null>(null);
    const { wasmModule } = useWasm();

    const [messageApi, contextHolder] = message.useMessage(); // Initialize message API
    const [showDefaultSetup, setShowDefaultSetup] = useState(false);

    const [settingUpBoard, setSettingUpBoard] = useState(false);

    const initialBoardCreated = useRef<boolean>(false)

    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (user?.task_management?.kanban?.columns && user.task_management.kanban.columns.length > 0 && !tasksLoading && !initialBoardCreated.current) {
            initialBoardCreated.current = true
            const existingTaskIds = new Set(selectedFilteredReportsTasks.map(task => task.id));
            const mappedColumns = user.task_management.kanban.columns.map((column) => ({
                id: column.column_name,
                title: column.column_name,
                cards: column.tasks
                    .filter(taskId => existingTaskIds.has(taskId)) // Only keep existing tasks
                    .map(taskId => {
                        const task = selectedFilteredReportsTasks.find(t => t.id === taskId);
                        return {
                            id: taskId,
                            title: task?.title || `Task ${taskId}`,
                            description: task?.description || `Details for task ${taskId}`,
                        };
                    }),
            }));

            setBoard({ columns: mappedColumns });
            setShowDefaultSetup(false)
            setSettingUpBoard(false)
        } else if (!tasksLoading && board?.columns?.length === 0) {
            setSettingUpBoard(false)
            setShowDefaultSetup(true)
        }
    }, [user, selectedFilteredReportsTasks, board?.columns?.length, tasksLoading]);

    useEffect(() => {
        if (!userLoading && !tasksLoading && !settingUpBoard) {
            setIsLoading(false)
        }

    }, [userLoading, tasksLoading, settingUpBoard])

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
            setShowDefaultSetup(false);
        } catch (err: unknown) {
            messageApi.error('Failed to create default setup');
            console.error(err)
        }
    };

    if (isLoading) return <p>Loading Kanban board...</p>;
    if (settingUpBoard) return <p>Setting up Kanban board...</p>;

    return (
        <div>

            <div className="flex">
                {contextHolder}

                {showDefaultSetup ?
                    <DefaultSetupComponent
                        onDefaultSetup={handleDefaultSetup}
                    />
                    :
                    board ? <div>
                        <UnassignedTasksIndicator
                            tasks={selectedFilteredReportsTasks}
                            kanbanColumns={user?.task_management?.kanban?.columns || []}
                        />
                        <ControlledBoard
                            onCardDragEnd={async (card, source, destination) => {
                                if (!destination || !source) {
                                    console.warn("Invalid source or destination. Dragging operation cancelled.");
                                    return;
                                }

                                setBoard((prevBoard) => (prevBoard ? moveCard(prevBoard, source, destination) : null));

                                if (!wasmModule || !user?.task_management?.kanban?.columns) {
                                    console.error("WASM module or user data is not available.");
                                    return;
                                }

                                const taskToUpdate = selectedFilteredReportsTasks.find((task) => task.id === card.id);

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

                                    const newOrder = [...destinationColumn.tasks];
                                    const destinationIndex = destination.toPosition ?? newOrder.length; // Use `toPosition` or append to the end if undefined
                                    newOrder.splice(destinationIndex, 0, card.id); // Insert the task at the new position

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
                                <CustomCard task={selectedFilteredReportsTasks.find((task) => task.id === card.id)} /> // Pass the entire task object to the card
                            )}
                            renderColumnHeader={(column) => (
                                <ColumnHeader
                                    title={column.title}
                                    cardsCount={column.cards.length}
                                    removeColumn={() => removeKanbanColumn(wasmModule, column.title)}
                                />
                            )}
                            allowAddCard={false}
                        >
                            {board}
                        </ControlledBoard></div> : ""}

            </div>
        </div>
    );
};

export default KanbanBoard;
