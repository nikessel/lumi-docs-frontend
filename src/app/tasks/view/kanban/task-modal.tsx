import React, { useState } from "react";
import { Modal, Button } from "antd";
import { Task } from "@wasm";
import { genColor } from "@/utils/styling-utils";
import { getDocumentIconLetters } from "@/utils/files-utils";
import clsx from "clsx";
import DueDateTag from "./due-date-tag";
import TaskStatusTag from "@/components/task-status-tag";
import CommentRenderAndAdder from "./comments-render-and-adder";

interface TaskModalProps {
    task: Task | undefined;
    isVisible: boolean;
    onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isVisible, onClose }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);

    if (!task) {
        return null;
    }

    const ass_doc_letters = task.associated_document
        ? getDocumentIconLetters(task.associated_document)
        : "N/A";

    const truncatedDescription = (text: string, isFull: boolean) =>
        isFull || text.length <= 250 ? text : `${text.substring(0, 250)}...`;

    return (
        <Modal
            title={<div className="flex items-center gap-x-4">
                <div>{task.title}</div>
                <TaskStatusTag status={task.status} />
            </div>
            }
            visible={isVisible}
            onCancel={onClose}
            footer={null}
        >
            <div className="text-sm font-semibold mb-2">Description</div>
            <div className="text-xs text-gray-600">
                {truncatedDescription(task.description, showFullDescription)}
                {task.description.length > 250 && (
                    <Button
                        type="link"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="ml-1"
                    >
                        {showFullDescription ? "Show less" : "Show more"}
                    </Button>
                )}
            </div>

            {/* Associated Document */}
            <div className="flex items-center justify-between mt-4">
                {task.associated_document && (
                    <div className="flex items-center ">
                        <div
                            className={clsx(
                                "flex items-center justify-center w-8 h-8 rounded-full mr-3 text-xs",
                                {
                                    "bg-gray-100": !task.associated_document,
                                }
                            )}
                            style={{
                                color: genColor(task.associated_document).color,
                                backgroundColor: genColor(task.associated_document).backgroundColor,
                            }}
                        >
                            {ass_doc_letters}
                        </div>
                        <div className="text-sm text-gray-700">
                            {task.associated_document}
                        </div>
                    </div>
                )}
                {task.id ? <DueDateTag task_id={task.id} /> : ""}
            </div>
            <div className="mt-4">
                {task.id ? <CommentRenderAndAdder task_id={task.id} /> : ""}
            </div>


            {/* Additional Task Details
            <div className="mt-4">
                <div className="flex items-center mt-2">
                    <DueDateTag dueDate={task.due_date || ""} />
                </div>
            </div> */}
        </Modal>
    );
};

export default TaskModal;
