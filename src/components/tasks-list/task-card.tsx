import React from "react";
import { Button, Skeleton } from "antd";
import Typography from "@/components/typography";
import { genColor } from "@/utils/styling-utils";

interface DocumentTaskCardProps {
    document_title: string;
    number_of_associated_tasks: number;
    document_icon_letters: string;
    isLoading: boolean;
    onView: () => void;
}

const DocumentTaskCard: React.FC<DocumentTaskCardProps> = ({
    document_title,
    number_of_associated_tasks,
    document_icon_letters,
    isLoading,
    onView,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                {/* Icon Skeleton */}
                <div className="flex items-center">
                    <Skeleton.Avatar active shape="circle" size="large" />
                    {/* Title and Task Count Skeleton */}
                    <div className="ml-3">
                        <Skeleton className="mb-1" active title={false} paragraph={{ rows: 1, width: "150px" }} />
                        <Skeleton active title={false} paragraph={{ rows: 1, width: "100px" }} />
                    </div>
                </div>
                {/* Button Skeleton */}
                <Skeleton.Button active size="small" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
            {/* Icon and Title Section */}
            <div className="flex items-center">
                {/* Icon */}
                <div
                    className="flex items-center justify-center w-10 h-10 rounded-full mr-3"
                    style={{
                        color: genColor(document_title).color,
                        backgroundColor: genColor(document_title).backgroundColor,
                    }}
                >
                    {document_icon_letters}
                </div>
                {/* Title and Task Count */}
                <div>
                    <Typography textSize="h6" className="font-bold">
                        {document_title}
                    </Typography>
                    <Typography textSize="small" color="secondary" className="mt-1">
                        {number_of_associated_tasks} implementation tasks
                    </Typography>
                </div>
            </div>
            {/* View Button */}
            <Button type="link" onClick={onView} className="p-0 text-blue-500">
                View
            </Button>
        </div>
    );
};

export default DocumentTaskCard;
