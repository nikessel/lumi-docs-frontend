import React from "react";
import { Button } from "antd";
import ReportCard from "./report-card";
import Typography from "@/components/typography";
import type { Report, Task } from "@wasm";
import { TaskWithReportId } from "@/hooks/tasks-hooks";

interface ReportListProps {
    reports: Report[];
    allTasks: TaskWithReportId[],
    isLoading: boolean
    onViewAll: () => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, onViewAll, isLoading, allTasks }) => {
    const displayedReports = reports.length < 4 ? [...reports, ...Array(4 - reports.length).fill(null)] : reports.slice(0, 4);

    return (
        <div className="">
            {/* Header */}
            <div className="flex gap-4 items-center mb-4">
                <Typography textSize="h3">My Reports</Typography>
                {reports.length > 0 ? <Button type="link" className="p-0 text-blue-500" onClick={onViewAll}>
                    View All
                </Button> : ""}
            </div>

            <div className="flex justify-between w-100">
                <ReportCard key={0} tasks={allTasks.filter((task) => task.reportId === displayedReports[0]?.id)} report={displayedReports[0]} isLoading={isLoading} isEmpty={!reports[0]} />
                <ReportCard key={1} tasks={allTasks.filter((task) => task.reportId === displayedReports[1]?.id)} report={displayedReports[1]} isLoading={isLoading} isEmpty={!reports[1]} />
            </div>
            <div className="flex justify-between w-100 mt-4">
                <ReportCard key={2} tasks={allTasks.filter((task) => task.reportId === displayedReports[2]?.id)} report={displayedReports[2]} isLoading={isLoading} isEmpty={!reports[2]} />
                <ReportCard key={3} tasks={allTasks.filter((task) => task.reportId === displayedReports[3]?.id)} report={displayedReports[3]} isLoading={isLoading} isEmpty={!reports[3]} />
            </div>
        </div>
    );
};

export default ReportList

