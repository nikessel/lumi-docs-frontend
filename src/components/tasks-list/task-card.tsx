import React from "react";
import { Button, Skeleton } from "antd";
import Typography from "@/components/typography";
import { genColor } from "@/utils/styling-utils";
import { useSearchParamsState } from "@/contexts/search-params-context";
import { createUrlWithParams } from "@/utils/url-utils";
import { useRouter, useSearchParams } from "next/navigation";

interface DocumentTaskCardProps {
    document_title: string;
    document_id: string | null,
    number_of_associated_tasks: number;
    document_icon_letters: string;
    isLoading: boolean;
    allReportIds: string[]
    isEmpty?: boolean;
}

const DocumentTaskCard: React.FC<DocumentTaskCardProps> = ({
    document_title,
    number_of_associated_tasks,
    document_icon_letters,
    isLoading,
    allReportIds,
    isEmpty,
    document_id,
}) => {
    const { toggleSelectedTaskDocuments } = useSearchParamsState()
    const searchParams = useSearchParams()
    const router = useRouter()

    const handleOnClickDocumentCard = async () => {
        console.log("asdasdasdasd", document_id, allReportIds)
        // document_id && await toggleSelectedTaskDocuments(document_id);
        // router.push(`/tasks/view/kanban?selectedTaskDocuments=${document_id}`)
        // const updatedSearchParams = new URLSearchParams(window.location.search);
        // const newUrl = createUrlWithParams("/tasks/view/kanban", updatedSearchParams);
        // console.log(newUrl, document_id);
        // router.push(newUrl); // Optionally update the URL
        if (!document_id) return;

        // await toggleSelectedTaskDocuments(document_id);

        // Set selectedReports to include all report IDs
        const updatedSearchParams = new URLSearchParams(searchParams.toString());
        updatedSearchParams.set("selectedReports", allReportIds.join(","));
        updatedSearchParams.set("selectedTaskDocuments", document_id);

        const newUrl = createUrlWithParams("/tasks/view/kanban", updatedSearchParams);

        router.push(newUrl);
    };

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

    if (isEmpty) {
        return (
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                <Typography textSize="small" color="secondary">
                    Tasks are automatically generated when you create reports
                </Typography>
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
            <Button type="link" onClick={handleOnClickDocumentCard} className="p-0 text-blue-500">
                View
            </Button>
        </div>
    );
};

export default DocumentTaskCard;
