import React from "react";
import { Progress } from "antd";
import Typography from "@/components/typography";
import { getComplianceColorCode } from "@/utils/formating";
import RegulatoryFrameworkTag from "@/components/regulatory-framework-tag";
import { useRouter } from "next/navigation";
import type { Report } from "@wasm";
import { Skeleton } from "antd";


interface ReportCardProps {
    report: Report | undefined
    isLoading: boolean
}

const ReportCard: React.FC<ReportCardProps> = ({
    report,
    isLoading
}) => {
    const router = useRouter()

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

    if (!report) return null;

    return (
        <div onClick={() => router.push(`/reports/view/overview?selectedReports=${report?.id}`)} className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:opacity-60 transition-opacity duration-300 ease-in-out" style={{ width: "45%" }}>
            <div className="flex justify-between">
                <Typography textSize="h5" className="font-bold text-gray-800">
                    {report.title}
                </Typography>
                <RegulatoryFrameworkTag standard={report.regulatory_framework} />
            </div>
            <Typography
                className="mt-2 text-gray-500"
            >
                {1000} unresolved tasks
            </Typography>
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
