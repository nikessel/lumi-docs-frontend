import React from "react";
import { Button } from "antd";
import ReportCard from "./report-card";
import Typography from "@/components/typography";

interface ReportListProps {
    reports: {
        regulatoryFramework: string;
        complianceRating: number;
        unresolvedTasks: number;
        title: string;
    }[];
    onViewAll: () => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, onViewAll }) => {
    const displayedReports = reports.slice(0, 4); // Show a maximum of 4 reports

    return (
        <div className="">
            {/* Header */}
            <div className="flex gap-4 items-center mb-4">
                <Typography textSize="h3">
                    My Reports
                </Typography>
                <Button type="link" onClick={onViewAll} className="p-0 text-blue-500">
                    View All
                </Button>
            </div>

            <div className="flex justify-between w-100">
                <ReportCard
                    key={0}
                    regulatoryFramework={displayedReports[0].regulatoryFramework}
                    complianceRating={displayedReports[0].complianceRating}
                    unresolvedTasks={displayedReports[0].unresolvedTasks}
                    title={displayedReports[0].title}
                />
                <ReportCard
                    key={1}
                    regulatoryFramework={displayedReports[1].regulatoryFramework}
                    complianceRating={displayedReports[1].complianceRating}
                    unresolvedTasks={displayedReports[1].unresolvedTasks}
                    title={displayedReports[1].title}

                />
            </div>
            <div className="flex justify-between w-100 mt-4">
                <ReportCard
                    key={2}
                    regulatoryFramework={displayedReports[2].regulatoryFramework}
                    complianceRating={displayedReports[2].complianceRating}
                    unresolvedTasks={displayedReports[2].unresolvedTasks}
                    title={displayedReports[2].title}

                />
                <ReportCard
                    key={3}
                    regulatoryFramework={displayedReports[3].regulatoryFramework}
                    complianceRating={displayedReports[3].complianceRating}
                    unresolvedTasks={displayedReports[3].unresolvedTasks}
                    title={displayedReports[3].title}

                />
            </div>


        </div>
    );
};

export default ReportList;
