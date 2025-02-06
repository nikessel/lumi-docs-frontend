import React, { useState, useEffect } from "react";
import { Progress } from "antd";
import Typography from "@/components/typography";
import { getComplianceColorCode } from "@/utils/formating";
import RegulatoryFrameworkTag from "@/components/regulatory-framework-tag";
import { useRouter, useSearchParams } from "next/navigation";
import type { Report } from "@wasm";
import { Skeleton } from "antd";
import { TaskWithReportId } from "@/hooks/tasks-hooks";
import { useSearchParamsState } from "@/contexts/search-params-context";
import { createUrlWithParams } from "@/utils/url-utils";
import { LinkOutlined } from "@ant-design/icons";

interface ReportCardProps {
    report: Report | undefined
    tasks: TaskWithReportId[] | null,
    isLoading: boolean,
    isEmpty?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({
    report,
    isLoading,
    isEmpty,
    tasks
}) => {
    const router = useRouter()
    const [unresolvedTasks, setUnresolvedTasks] = useState<TaskWithReportId[] | null>(null)
    const { toggleSelectedReport } = useSearchParamsState()

    useEffect(() => {
        const unresolvedTasks = tasks?.filter((task) => task.status !== "open")
        unresolvedTasks && setUnresolvedTasks(unresolvedTasks)
    }, [tasks])

    const handleClickReportTitle = async () => {
        router.push(`/reports/view/overview?selectedReports=${report?.id}`)
        // report?.id && await toggleSelectedReport(report?.id)
        // const updatedSearchParams = new URLSearchParams(window.location.search);
        // const newUrl = createUrlWithParams("/reports/view/overview", updatedSearchParams);
        // router.push(newUrl);
    }

    const handleClickUnresolvedTasks = async () => {
        router.push(`/tasks/view/overview?selectedReports=${report?.id}`)        // report?.id && await toggleSelectedReport(report?.id)
        // const updatedSearchParams = new URLSearchParams(window.location.search);
        // const newUrl = createUrlWithParams("/tasks/view/overview", updatedSearchParams);
        // router.push(newUrl);
    }

    if (isLoading) {
        return (
            <div className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:opacity-60 transition-opacity duration-300 ease-in-out" style={{ width: "45%" }}>
                <div className="flex justify-between">
                    <Skeleton.Input active size="small" style={{ width: "70%" }} />
                    <Skeleton.Button active size="small" shape="round" />
                </div>
                <div className="mt-4">
                    <Skeleton.Button active size="small" style={{ width: "100%" }} />
                </div>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center" style={{ width: "45%", height: "100px" }}>
                <Typography textSize="small" color="secondary">
                    New reports will be shown here
                </Typography>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className="p-4 bg-gray-50 rounded-lg" style={{ width: "45%" }}>
            <div className="flex justify-between ">
                <div onClick={handleClickReportTitle} className="text-md font-bold hover:text-primary cursor-pointer transition-opacity duration-300 ease-in-out">
                    {report.title}
                    <LinkOutlined className="ml-1" />
                </div>
                <RegulatoryFrameworkTag standard={report.regulatory_framework} />
            </div>
            <div
                onClick={handleClickUnresolvedTasks}
                className="mt-2 text-gray-500 hover:text-primary cursor-pointer transition-opacity duration-300 ease-in-out"
            >
                {unresolvedTasks?.length || 0} unresolved tasks
                <LinkOutlined className="ml-1" />
            </div>
            <div className="mt-4">
                <Progress
                    percent={report.compliance_rating}
                    size="small"
                />
            </div>
        </div>
    );
};

export default ReportCard;
