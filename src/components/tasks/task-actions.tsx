import React, { useState } from 'react';
import { Space, Button, Modal, Typography, Tag } from 'antd';
import { Task } from "@wasm";
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
import { updateTaskStatus } from '@/utils/tasks-utils';

const { Title, Paragraph, Text } = Typography;

interface TaskActionsProps {
    task: Task;
}

const getSuggestionTagColor = (kind: string) => {
    switch (kind) {
        case "edit_paragraph":
            return "blue";
        case "add_paragraph":
            return "green";
        case "remove_paragraph":
            return "red";
        case "new_document":
            return "purple";
        default:
            return "default";
    }
};

const TaskActions: React.FC<TaskActionsProps> = ({ task }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isIgnoring, setIsIgnoring] = useState(false);
    const [isReopening, setIsReopening] = useState(false);

    const { wasmModule } = useWasm();

    const handleViewSuggestion = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleIgnore = async () => {
        setIsIgnoring(true);
        try {
            await updateTaskStatus(wasmModule, task, "ignored");
            console.log(`Task ${task.id} marked as ignored`);
        } catch (error) {
            console.error(`Failed to ignore task ${task.id}:`, error);
        } finally {
            setIsIgnoring(false);
        }
    };

    const handleReopen = async () => {
        setIsReopening(true);
        try {
            await updateTaskStatus(wasmModule, task, "open");
            console.log(`Task ${task.id} marked as ignored`);
        } catch (error) {
            console.error(`Failed to ignore task ${task.id}:`, error);
        } finally {
            setIsReopening(false);
        }
    };

    return (
        <>
            <Space size="middle">
                <Button
                    type="default"
                    size="small"
                    onClick={handleViewSuggestion}
                    disabled={!task.suggestion}
                >
                    View Suggestion
                </Button>
                {task.status !== "ignored" ?
                    <Button
                        type="default"
                        size="small"
                        danger
                        loading={isIgnoring}
                        onClick={handleIgnore}
                    >
                        Ignore
                    </Button> :
                    <Button
                        type="default"
                        size="small"
                        loading={isReopening}
                        onClick={handleReopen}
                    >
                        Re-open
                    </Button>

                }
            </Space>

            {/* Modal for Viewing Suggestion */}
            <Modal
                title={`Suggestion for ${task.title}`}
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
            >
                {task.suggestion ? (
                    <Typography>
                        <Title level={5}>
                            <Tag color={getSuggestionTagColor(task.suggestion.kind)}>
                                {task.suggestion.kind.replace('_', ' ').toUpperCase()}
                            </Tag>
                        </Title>
                        <Paragraph>
                            <Text strong>Description:</Text> {task.suggestion.description}
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Content:</Text> {task.suggestion.content}
                        </Paragraph>
                    </Typography>
                ) : (
                    <Typography.Text type="secondary">
                        No suggestion available for this task.
                    </Typography.Text>
                )}
            </Modal>
        </>
    );
};

export default TaskActions;
