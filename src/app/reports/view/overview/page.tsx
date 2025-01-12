'use client';
import Tree from "./tree-view";
import { Card, Statistic } from 'antd';
import { getComplianceColorCode } from "@/utils/formating";

const Page = () => {
    return (
        <div className="h-full flex flex-col gap-4">
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
            <div >
                <Tree />
            </div>
        </div>
    );
};

export default Page;
