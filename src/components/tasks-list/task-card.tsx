import React from "react";
import { Button, Skeleton } from "antd";
import Typography from "@/components/typography";
import { genColor } from "@/utils/styling-utils";
import { createUrlWithParams } from "@/utils/url-utils";
import { useRouter, useSearchParams } from "next/navigation";

interface DocumentTaskCardProps {
    document_title: string;
    document_id: string | null,
    number_of_associated_tasks: number;
    document_icon_letters: string;
    isLoading: boolean;
    allReportIds: string[]
}

const DocumentTaskCard: React.FC<DocumentTaskCardProps> = ({
    document_title,
    number_of_associated_tasks,
    document_icon_letters,
    isLoading,
    allReportIds,
    document_id,
}) => {
    const searchParams = useSearchParams()
    const router = useRouter()

    const handleOnClickDocumentCard = async () => {
        if (!document_id) return;
        const updatedSearchParams = new URLSearchParams(searchParams.toString());
        updatedSearchParams.set("selectedReports", allReportIds.join(","));
        updatedSearchParams.set("selectedTaskDocuments", document_id);
        const newUrl = createUrlWithParams("/tasks/view/kanban", updatedSearchParams);
        router.push(newUrl);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                <div className="flex items-center">
                    <Skeleton.Avatar active shape="circle" size="large" />
                    <div className="ml-3">
                        <Skeleton className="mb-1" active title={false} paragraph={{ rows: 1, width: "150px" }} />
                        <Skeleton active title={false} paragraph={{ rows: 1, width: "100px" }} />
                    </div>
                </div>
                <Skeleton.Button active size="small" />
            </div>
        );
    }

    if (document_id) {
        return (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2" >
                <div className="flex items-center">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-full mr-3"
                        style={{
                            color: genColor(document_title).color,
                            backgroundColor: genColor(document_title).backgroundColor,
                        }}
                    >
                        {document_icon_letters}
                    </div>
                    <div>
                        <Typography textSize="h6" className="font-bold">
                            {document_title}
                        </Typography>
                        <Typography textSize="small" color="secondary" className="mt-1">
                            {number_of_associated_tasks} implementation tasks
                        </Typography>
                    </div>
                </div>
                <Button type="link" onClick={handleOnClickDocumentCard} className="p-0 text-blue-500">
                    View
                </Button>
            </div >
        );
    }
};

export default DocumentTaskCard;
