import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import Typography from '@/components/typography';
import { Task } from '@wasm';

interface TaskCommentCardProps {
    task: Task;
}

const MAX_LENGTH = 250;

const TaskCommentCard: React.FC<TaskCommentCardProps> = ({ task }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const handleOpenModal = () => setIsModalVisible(true);
    const handleCloseModal = () => setIsModalVisible(false);

    const toggleCommentExpansion = (index: number) => {
        setExpandedComments((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    const toggleDescriptionExpansion = () => {
        setIsDescriptionExpanded((prevState) => !prevState);
    };

    const allComments = task.comments || [];
    const latestComment = allComments[0]?.content || 'No comments available';
    const latestCommentDate = allComments[0]?.created_date
        ? new Date(allComments[0].created_date).toLocaleDateString()
        : 'No date available';

    const truncateText = (text: string, isExpanded: boolean) =>
        isExpanded || text.length <= MAX_LENGTH ? text : `${text.slice(0, MAX_LENGTH)}...`;

    return (
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm mb-4">
            {/* Task Title and Latest Comment Date */}
            <div className="flex gap-x-4 items-center">
                <Typography textSize="h6" className="font-bold">
                    {task.title}
                </Typography>
                <Typography textSize="h6" color="secondary">
                    {latestCommentDate}
                </Typography>
            </div>

            {/* Task Description */}
            <Typography textSize="small" className="text-gray-600 mb-2">
                {truncateText(task.description, isDescriptionExpanded)}
                {task.description.length > MAX_LENGTH && (
                    <Button type="link" className="text-xs" onClick={toggleDescriptionExpansion}>
                        {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                    </Button>
                )}
            </Typography>

            {/* Latest Comment */}
            <Typography textSize="small" className="italic text-gray-500 mb-4">
                {truncateText(latestComment, !!expandedComments[0])}
                {latestComment.length > MAX_LENGTH && (
                    <Button type="link" className="text-xs" onClick={() => toggleCommentExpansion(0)}>
                        {expandedComments[0] ? 'Show Less' : 'Show More'}
                    </Button>
                )}
            </Typography>

            {/* View Thread Button */}
            <Button type="link" onClick={handleOpenModal}>
                View Thread
            </Button>

            {/* Modal */}
            <Modal
                title="Comments Thread"
                visible={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
            >
                {allComments.map((comment, index) => (
                    <div key={index} className="mb-4">
                        <Typography textSize="small">
                            {truncateText(comment.content, !!expandedComments[index])}
                        </Typography>
                        {comment.content.length > MAX_LENGTH && (
                            <Button
                                type="link"
                                onClick={() => toggleCommentExpansion(index)}
                                className="text-xs"
                            >
                                {expandedComments[index] ? 'Show Less' : 'Show More'}
                            </Button>
                        )}
                    </div>
                ))}
            </Modal>
        </div >
    );
};

export default TaskCommentCard;
