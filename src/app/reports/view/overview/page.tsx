'use client';
import Tree from "./tree-view";
import { Card, Statistic } from 'antd';
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

const Page = () => {
    const { reports } = useSelectedFilteredReportsContext();
    const { tasks } = useSelectedFilteredReportsTasksContext();
    const analyzedReports = analyzeReports(reports);

    const averageCompliance = reports.length > 0
        ? reports.reduce((total, report) => {
            const sectionRatings = Array.from(report.section_assessments || []).map(
                ([, section]) => section.compliance_rating
            );
            const reportComplianceSum = sectionRatings.reduce((sum, rating) => sum + rating, 0);
            const numSections = sectionRatings.length;
            return total + (numSections > 0 ? reportComplianceSum / numSections : 0);
        }, 0) / reports.length
        : 0;

    const analyzedTasks = analyzeTasks(tasks);

    return (
        <div className="flex flex-col gap-4" style={{ height: "70vh" }} >
            <div className="flex items-stretch gap-2 h-auto w-full">
                <div className="flex-1">
                    <Card bordered={false} className="h-full">
                        <Statistic
                            title="Reports (requirements)"
                            value={reports.length}
                            precision={0}
                            formatter={(value) => `${value} (${analyzedReports.numberOfRequirementAssessments + analyzedReports.numberOfRequirementGroupAssessments})`}
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
