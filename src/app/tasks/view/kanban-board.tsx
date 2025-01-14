import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, message } from 'antd';
import JiraCard from './custom-card';
import ColumnHeader from './column-header';
import { useUser } from '@/hooks/user-hooks';
import { addKanbanColumn, removeKanbanColumn } from '@/utils/kanban-utils';
import { useWasm } from '@/components/WasmProvider';
import { ControlledBoard, moveCard, KanbanBoard as KanbanBoardType, Card, OnDragEndNotification } from '@caldwell619/react-kanban';
import { useSelectedFilteredReportsTasks } from '@/hooks/tasks-hooks';

interface CustomKanbanCard extends Card {
    storyPoints: number;
    assigneeId: number;
}

const KanbanBoard: React.FC = () => {
    const { wasmModule } = useWasm();
    const [refreshTrigger, setRefreshTrigger] = useState(0); // State for triggering refresh
    const { user, kanbanColumns, loading, error } = useUser(refreshTrigger);
    const { tasks, loading: tasksLoading, error: tasksError } = useSelectedFilteredReportsTasks();

    const [board, setBoard] = useState<KanbanBoardType<CustomKanbanCard>>({
        columns: kanbanColumns.map((column) => ({
            id: column.id,
            title: column.title,
            cards: [], // Initially empty array for cards
        })),
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");

    // Update board when kanbanColumns change
    useEffect(() => {
        setBoard({
            columns: kanbanColumns.map((column) => ({
                id: column.id,
                title: column.title,
                cards: [],
            })),
        });
    }, [kanbanColumns]);

    console.log("TASKSSSS", tasks)

    const handleAddColumn = async () => {
        if (!newColumnName.trim()) {
            message.warning("Column name cannot be empty");
            return;
        }

        try {
            const updatedUser = await addKanbanColumn(wasmModule, newColumnName.trim());
            console.log("updatedUser", updatedUser)
            if (updatedUser) {
                message.success(`Column "${newColumnName}" added successfully`);
                setNewColumnName("");
                setIsModalOpen(false);
                setRefreshTrigger((prev) => prev + 1); // Trigger refresh
            }
        } catch (err) {
            message.error("Failed to add column");
        }
    };

    const handleRemoveColumn = async (columnId: string) => {
        try {
            const updatedUser = await removeKanbanColumn(wasmModule, columnId);
            if (updatedUser) {
                message.success(`Column removed successfully`);
                setRefreshTrigger((prev) => prev + 1); // Trigger refresh
            }
        } catch (err) {
            message.error("Failed to remove column");
        }
    };

    const handleCardMove: OnDragEndNotification<CustomKanbanCard> = (card, source, destination) => {
        setBoard((currentBoard) => moveCard(currentBoard, source, destination));
    };

    if (loading) return <p>Loading Kanban board...</p>;
    if (error) return <p>Error loading Kanban board: {error}</p>;

    return (
        <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2>Kanban Board</h2>
                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                    Add Column
                </Button>
            </div>
            <ControlledBoard
                onCardDragEnd={handleCardMove}
                renderColumnHeader={(column) => (
                    <ColumnHeader
                        title={column.title}
                        cardsCount={column.cards.length}
                        removeColumn={() => handleRemoveColumn(String(column.id))}
                    />
                )}
            >
                {board}
            </ControlledBoard>
            <Modal
                title="Add New Column"
                visible={isModalOpen}
                onOk={handleAddColumn}
                onCancel={() => setIsModalOpen(false)}
            >
                <Input
                    placeholder="Enter column name"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default KanbanBoard;
