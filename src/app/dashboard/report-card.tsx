import React from "react";
import { Progress } from "antd";
import Typography from "@/components/typography";
import { getComplianceColorCode } from "@/utils/formating";
import RegulatoryFrameworkTag from "@/components/regulatory-framework-tag";

interface ReportCardProps {
    regulatoryFramework: string;
    complianceRating: number;
    unresolvedTasks: number;
    title: string
}

const ReportCard: React.FC<ReportCardProps> = ({
    regulatoryFramework,
    complianceRating,
    unresolvedTasks,
    title
}) => {
    return (
        <div className="p-4 bg-gray-50  rounded-lg" style={{ width: "45%" }}>
            <div className="flex justify-between">
                <Typography textSize="h5" className="font-bold text-gray-800">
                    {title}
                </Typography>
                <RegulatoryFrameworkTag standard={regulatoryFramework} />

            </div>
            <Typography
                className="mt-2 text-gray-500"
            >
                {unresolvedTasks} unresolved tasks
            </Typography>
            <div className="mt-4">
                <Progress
                    percent={complianceRating}
                    size="small"
                />
            </div>
        </div>
    );
};

export default ReportCard;
