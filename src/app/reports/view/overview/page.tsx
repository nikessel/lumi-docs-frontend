'use client';
import { Card, Statistic, Skeleton } from 'antd';
import { getSimplefiedComplianceColorCode } from "@/utils/formating";
import WaffleChart from "./components/waffle-canvas-view";
import ComplianceBarChart from "./components/horizontal-bars";
import { analyzeReports } from "@/utils/advanced-charts-utils";
import { analyzeTasks } from "@/utils/tasks-utils";
import { useReportsContext } from "@/contexts/reports-context";
import { useTasksContext } from '@/contexts/tasks-context';

const Page = () => {
    const { filteredSelectedReports, loading: reportsLoading } = useReportsContext();
    const { selectedFilteredReportsTasks, loading: tasksLoading } = useTasksContext();

    const analyzedReports = analyzeReports(filteredSelectedReports);

    const averageCompliance = filteredSelectedReports.length
        ? filteredSelectedReports.reduce((sum, report) => sum + (report.compliance_rating || 0), 0) / filteredSelectedReports.length
        : 0;

    const analyzedTasks = analyzeTasks(selectedFilteredReportsTasks);

    const isLoading = reportsLoading || tasksLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4" style={{ height: "70vh" }} >
                <div className="flex items-stretch gap-2 h-auto w-full">
                    <div className="flex-1">
                        <Card bordered={false} className="h-full">
                            <Skeleton active />
                        </Card>
                    </div>
                    <div className="flex-1">
                        <Card bordered={false} className="h-full">
                            <Skeleton active />
                        </Card>
                    </div>
                    <div className="flex-1">
                        <Card bordered={false} className="h-full">
                            <Skeleton active />
                        </Card>
                    </div>
                </div>

                <div className="flex justify-between" style={{ width: "100%", height: "55vh" }}>
                    <Skeleton.Node active={true} style={{ width: 450, height: 350 }} />
                    <Skeleton.Node active={true} style={{ width: 450, height: 350 }} />

                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4" style={{ height: "70vh" }} >
            <div className="flex items-stretch gap-2 h-auto w-full">
                <div className="flex-1">
                    <Card bordered={false} className="h-full">
                        <Statistic
                            title="Reports (requirements)"
                            value={filteredSelectedReports.length}
                            precision={0}
                            formatter={(value) => `${value} (${analyzedReports.numberOfRequirementAssessments})`}
                        />
                    </Card>
                </div>

                <div className="flex-1">
                    <Card bordered={false} className="h-full">
                        <Statistic
                            title="Average Compliance"
                            value={averageCompliance}
                            precision={0}
                            valueStyle={{ color: getSimplefiedComplianceColorCode(averageCompliance) }}
                            suffix="%"
                        />
                    </Card>
                </div>

                <div className="flex-1">
                    <Card bordered={false} className="h-full">
                        <Statistic
                            title="Tasks (resolved)"
                            value={analyzedTasks.totalTasks}
                            precision={0}
                            formatter={(value) => `${value} (${analyzedTasks.tasksByStatus["completed"] + analyzedTasks.tasksByStatus["ignored"]})`}
                        />
                    </Card>
                </div>
            </div>
            <div className="flex" style={{ width: "100%", height: "55vh" }}>
                <div style={{ width: "50%" }} >
                    <WaffleChart />
                </div>
                <div style={{ width: "50%" }} >
                    <ComplianceBarChart />
                </div>
            </div>
        </div>
    );
};

export default Page;
