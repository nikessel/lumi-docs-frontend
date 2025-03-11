import React from "react";
import { Skeleton } from "antd";
import Typography from "@/components/common/typography";
import { createUrlWithParams } from "@/utils/url-utils";
import { useRouter, useSearchParams } from "next/navigation";
import DocumentIcon from "@/components/files/document-icon";
import RegulatoryFrameworkTag from "@/components/reports/regulatory-framework-tag";
import { Task } from "@wasm";
import { useReportsContext } from "@/contexts/reports-context";
import { TaskWithReportId } from "@/hooks/tasks-hooks";

interface TaskCardProps {
    task: TaskWithReportId;
    isLoading: boolean;
    allReportIds: string[];
    documentTitle: string
}

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    isLoading,
    allReportIds,
    documentTitle
}) => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { reports } = useReportsContext();
    const handleOnClickTaskCard = async () => {
        const updatedSearchParams = new URLSearchParams(searchParams.toString());
        updatedSearchParams.set("selectedReports", allReportIds.join(","));
        const newUrl = createUrlWithParams("/reports/view/to_do", updatedSearchParams);
        router.push(newUrl);
    };

    // Find the report associated with this task
    const associatedReport = reports.find(report => report.id === task.reportId);
    const regulatoryFramework = associatedReport?.regulatory_framework;

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
            </div>
        );
    }

    return (
        <div
            onClick={handleOnClickTaskCard}
            className="flex items-center p-3 bg-gray-50 rounded-lg mb-2 hover:bg-gray-100 transition-colors cursor-pointer"
        >
            <div className="flex items-center">
                <div className="mr-4">
                    {task.associated_document ? (
                        <DocumentIcon
                            documentTitle={documentTitle}
                            letters={documentTitle.substring(0, 2).toUpperCase()}
                            size="medium"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-500 text-xs font-medium">
                            NEW
                        </div>
                    )}
                </div>
                <div>
                    <Typography textSize="h6" className="font-bold">
                        {task.title}
                    </Typography>
                    {/* <Typography
                        textSize="small"
                        color="secondary"
                        className="mt-1 line-clamp-2"
                    >
                        {task.description}
                    </Typography> */}
                    {regulatoryFramework && (
                        <div className="mt-2">
                            <RegulatoryFrameworkTag standard={regulatoryFramework} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
