'use client';
import Tree from "./tree-view";
import { Card, Statistic, Skeleton } from 'antd';
import { getComplianceColorCode } from "@/utils/formating";
import { useSelectedFilteredReports } from "@/hooks/report-hooks";
import TreeView from "./tree-view-new";
import WaffleChart from "./waffle-canvas-view";
import Typography from "@/components/typography";
import NetworkChart from "./network-chart";
import ComplianceBarChart from "./horizontal-bars";
import { useSelectedFilteredReportsContext } from "@/contexts/reports-context/selected-filtered-reports";
import { useSelectedFilteredReportsTasksContext } from "@/contexts/tasks-context/selected-filtered-report-tasks";
import { analyzeReports } from "@/utils/advanced-charts-utils";
import { analyzeTasks } from "@/utils/tasks-utils";
import { DotChartOutlined } from '@ant-design/icons';

const Page = () => {
    const { reports, loading: reportsLoading } = useSelectedFilteredReportsContext();
    const { tasks, loading: tasksLoading } = useSelectedFilteredReportsTasksContext();

    console.log("reports", reports)

    const analyzedReports = analyzeReports(reports);

    const averageCompliance = reports.length
        ? reports.reduce((sum, report) => sum + (report.compliance_rating || 0), 0) / reports.length
        : 0;

    const analyzedTasks = analyzeTasks(tasks);

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
                            value={reports.length}
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
                            valueStyle={{ color: getComplianceColorCode(averageCompliance) }}
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
