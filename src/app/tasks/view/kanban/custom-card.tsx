import React, { useState } from "react";
import { Card, Button, Badge } from "antd";
import { Task } from "@wasm";
import TaskModal from "./task-modal";
import { genColor } from "@/utils/styling-utils";
import { getDocumentIconLetters } from "@/utils/files-utils";
import { ArrowsAltOutlined } from "@ant-design/icons";
import DueDateTag from "./due-date-tag";

interface CustomCardProps {
    task: Task | undefined;
}

const max_char = 50;

const CustomCard: React.FC<CustomCardProps> = ({ task }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    if (!task) {
        return null;
    }

    const ass_doc_letters = task.associated_document
        ? getDocumentIconLetters(task.associated_document)
        : "N/A";

    const handleOpenModal = () => setIsModalVisible(true);
    const handleCloseModal = () => setIsModalVisible(false);

    const truncatedDescription = (text: string, isFull: boolean) =>
        isFull || text.length <= max_char ? text : `${text.substring(0, max_char)}...`;

    console.log("asaasasas", task)

    return (
        <>
            <Card
                style={{
                    width: "300px",
                }}
                className="my-2 cursor-pointer"
                onClick={handleOpenModal}
            >
                <div className="flex justify-between items-center mb-2">
                    <div className="text-base">{task.title}</div>
                    <Button
                        type="default"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent modal from opening
                            handleOpenModal();
                        }}
                        icon={<ArrowsAltOutlined />}
                    />
                </div>
                <div style={{ fontSize: "12px", color: "#555" }}>
                    {truncatedDescription(task.description, showFullDescription)}
                    {task.description.length > max_char && (
                        <Button
                            type="link"
                            style={{ padding: 0, marginLeft: 4 }}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent modal from opening
                                setShowFullDescription(!showFullDescription);
                            }}
                        >
                            {showFullDescription ? "Show less" : "Show more"}
                        </Button>
                    )}
                </div>
                <div className="flex items-center justify-between mt-2">
                    {task?.associated_document && (
                        <div className="flex items-center ">
                            <div
                                className="flex items-center justify-center w-8 h-8 rounded-full mr-3 text-xs"
                                style={{
                                    color: genColor(task?.associated_document || "N/A").color,
                                    backgroundColor: genColor(task?.associated_document || "N/A").backgroundColor,
                                }}
                            >
                                {ass_doc_letters}
                            </div>
                            <div className="text-text_secondary">
                                {task?.associated_document}
                            </div>
                        </div>
                    )}
                    {task?.comments?.length && task?.comments?.length > 0 ? <Badge count={task?.comments?.length} /> : ""}
                </div>

                <div className="mt-4">{task.id ? <DueDateTag task_id={task.id} /> : ""}</div>

            </Card>

            {/* Task Modal */}
            <TaskModal
                task={task}
                isVisible={isModalVisible}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default CustomCard;
