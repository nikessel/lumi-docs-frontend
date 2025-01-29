import React from "react";
import { Button } from "antd";
import ReportCard from "./report-card";
import Typography from "@/components/typography";
import type { Report } from "@wasm";


interface ReportListProps {
    reports: Report[];
    isLoading: boolean
    onViewAll: () => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, onViewAll, isLoading }) => {
    const displayedReports = reports.slice(0, 4);

    return (
        <div className="">
            {/* Header */}
            <div className="flex gap-4 items-center mb-4">
                <Typography textSize="h3">
                    My Reports
                </Typography>
                <Button type="link" className="p-0 text-blue-500" onClick={onViewAll}>
                    View All
                </Button>
            </div>

            <div className="flex justify-between w-100">
                <ReportCard
                    key={0}
                    report={displayedReports[0]}
                    isLoading={isLoading}
                />
                <ReportCard
                    key={1}
                    report={displayedReports[1]}
                    isLoading={isLoading}
                />
            </div>
            <div className="flex justify-between w-100 mt-4">
                <ReportCard
                    key={2}
                    report={displayedReports[2]}
                    isLoading={isLoading}
                />
                <ReportCard
                    key={3}
                    report={displayedReports[3]}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default ReportList;
