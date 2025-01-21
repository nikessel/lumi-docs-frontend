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

const Page = () => {

    return (
        <div className="flex flex-col gap-4" style={{ height: "70vh" }} >
            <div className="flex items-stretch gap-2 h-auto w-full">
                <div className="flex-1">
                    <Card bordered={false} className="h-full">
                        <Statistic
                            title="Reports (requirements)"
                            value={3}
                            precision={0}
                            formatter={(value) => `${value} (${92})`}
                        />
                    </Card>
                </div>

                <div className="flex-1">
                    <Card bordered={false} className="h-full">
                        <Statistic
                            title="Average Compliance"
                            value={11.28}
                            precision={0}
                            valueStyle={{ color: getComplianceColorCode(11) }}
                            suffix="%"
                        />
                    </Card>
                </div>

                <div className="flex-1">
                    <Card bordered={false} className="h-full">
                        <Statistic
                            title="Tasks (resolved)"
                            value={150}
                            precision={0}
                            formatter={(value) => `${value} (${64})`}
                        />
                    </Card>
                </div>
            </div>
            <div className="flex" style={{ width: "100%", height: "55vh" }}>
                <div style={{ width: "50%" }} >
                    {/* <Typography textSize="h5" className="my-2" color="secondary">Compliance Assesments Grouped by Rating</Typography> */}
                    <WaffleChart />
                </div>
                <div style={{ width: "50%" }} >
                    {/* <Typography textSize="h5" className="my-2" color="secondary">Compliance Tree View</Typography> */}
                    <ComplianceBarChart />
                </div>
                {/* <TreeView reports={reports} />
                <Tree /> */}
            </div>
        </div>
    );
};

export default Page;
