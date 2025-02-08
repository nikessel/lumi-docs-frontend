import React, { useState, useMemo, useEffect } from "react";
import { Button, Input, message } from "antd";
import { useWasm } from "@/components/WasmProvider";
import { updateTask } from "@/utils/tasks-utils";
import { DeleteOutlined } from "@ant-design/icons";
import { useTasksContext } from "@/contexts/tasks-context";

interface CommentRenderAndAdderProps {
    task_id: string;
}

const CommentRenderAndAdder: React.FC<CommentRenderAndAdderProps> = ({ task_id }) => {
    const { selectedFilteredReportsTasks } = useTasksContext();
    const { wasmModule } = useWasm();

    const max_default_chars = 50; // Maximum number of characters to display by default

    const task = useMemo(() => selectedFilteredReportsTasks.find((t) => t.id === task_id), [selectedFilteredReportsTasks, task_id]);
    const [commentsToShow, setCommentsToShow] = useState<number>(5);
    const [newComment, setNewComment] = useState<string>("");
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
    const [messageApi, contextHolder] = message.useMessage(); // Initialize message API
    const [deletingComment, setDeletingComment] = useState<{ content: string, created_date: string } | null>(null)
    const [prevCommentsLength, setPrevCommentsLength] = useState<number | null>(null);
    const [addingComment, setAddingComment] = useState<boolean>(false);

    // Sort comments by most recent
    const sortedComments = useMemo(() => {
        if (!task?.comments) return [];
        return [...task.comments].sort(
            (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
        );
    }, [task?.comments]);

    useEffect(() => {
        if ((task?.comments?.length || task?.comments?.length === 0) && (prevCommentsLength || prevCommentsLength === 0)) {
            task?.comments?.length > prevCommentsLength && messageApi.success("Comment added successfully.");
            task?.comments?.length < prevCommentsLength && messageApi.success("Comment deleted successfully.");
            setAddingComment(false);
            setNewComment("");
        }
        (task?.comments?.length || task?.comments?.length === 0) && setPrevCommentsLength(task?.comments?.length)
    }, [task?.comments, messageApi, prevCommentsLength])

    const visibleComments = useMemo(() => sortedComments.slice(0, commentsToShow), [sortedComments, commentsToShow]);

    if (!task) return null;

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            messageApi.error("Comment cannot be empty.");
            return;
        }
        setAddingComment(true)
        if (!wasmModule) {
            messageApi.error("An error occurred. Support: WASM module is not available.");
            return;
        }
        try {
            const updatedComments = [
                ...sortedComments,
                { content: newComment, created_date: new Date().toISOString() },
            ];
            await updateTask(wasmModule, task, { comments: updatedComments });

        } catch (error) {
            console.error("Failed to add comment:", error);
            setAddingComment(false)
            messageApi.error("Failed to add comment.");
        }
    };

    const handleDeleteComment = async (index: number) => {
        if (!wasmModule) {
            messageApi.error("An error occurred. Support: WASM module is not available.");
            return;
        }
        setDeletingComment({ content: sortedComments[index].content, created_date: sortedComments[index].created_date });
        try {
            const updatedComments = sortedComments.filter((_, i) => i !== index);
            await updateTask(wasmModule, task, { comments: updatedComments });

        } catch (error) {
            console.error("Failed to delete comment:", error);
            messageApi.error("Failed to delete comment.");
            setDeletingComment(null);

        }
    };

    const toggleExpandComment = (index: number) => {
        setExpandedComments((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    return (
        <div>
            {contextHolder}
            <div>
                {visibleComments.map((comment, index) => {
                    const isExpanded = expandedComments.has(index);
                    const contentToDisplay = isExpanded
                        ? comment.content
                        : comment.content.slice(0, max_default_chars);

                    return (
                        <div
                            key={index}
                            className="p-2 mb-2 border rounded bg-gray-50 relative"

                        >
                            <Button
                                type="text"
                                loading={sortedComments[index].content === deletingComment?.content && sortedComments[index].created_date === deletingComment?.created_date}
                                icon={<DeleteOutlined />}
                                size="small"
                                style={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                }}
                                onClick={() => handleDeleteComment(index)}
                            />
                            <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                                {new Date(comment.created_date).toLocaleString()}
                            </div>
                            <div style={{ fontSize: "14px" }}>
                                {contentToDisplay}
                                {comment.content.length > max_default_chars && (
                                    <Button
                                        type="link"
                                        style={{ marginLeft: 8, padding: 0 }}
                                        onClick={() => toggleExpandComment(index)}
                                    >
                                        {isExpanded ? "Show less" : "Show more"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {sortedComments.length > commentsToShow && (
                <Button
                    type="link"
                    onClick={() => setCommentsToShow(sortedComments.length)}
                >
                    Show more
                </Button>
            )}
            {commentsToShow > 5 && sortedComments.length > 5 && (
                <Button
                    type="link"
                    onClick={() => setCommentsToShow(5)}
                >
                    Show less
                </Button>
            )}
            <div className="mt-4">
                <Input.TextArea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                />
                <Button
                    type="primary"
                    className="mt-2"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    loading={addingComment}
                >
                    Add Comment
                </Button>
            </div>
        </div>
    );
};

export default CommentRenderAndAdder;
