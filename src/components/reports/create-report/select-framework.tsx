import React, { useState } from "react";
import { Typography, Button, Card, Row, Col } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { RegulatoryFramework } from "@wasm";
import { useCreateReportStore } from "@/stores/create-report-store";
import { getSupportedFrameworks } from "@/utils/regulatory-frameworks-utils";
import RegulatoryFrameworkTag from "@/components/reports/regulatory-framework-tag";

interface FrameworkInfo {
    id: RegulatoryFramework;
    description: string;
}

const SelectFramework: React.FC = () => {
    const router = useRouter();
    const { selectedFramework, setSelectedFramework } = useCreateReportStore();
    const [loadingFramework, setLoadingFramework] = useState<RegulatoryFramework | null>(null);
    const frameworks: FrameworkInfo[] = getSupportedFrameworks();

    const handleFrameworkClick = (frameworkId: RegulatoryFramework) => {
        setLoadingFramework(frameworkId);
        //setSelectedFramework(frameworkId);
        // Reset loading state after a short delay
        setTimeout(() => setSelectedFramework(frameworkId), 500);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Row gutter={[16, 16]}>
                {frameworks.map((framework) => (
                    <Col xs={24} sm={12} md={8} key={framework.id}>
                        <Card
                            hoverable
                            className={`h-full cursor-pointer transition-all relative ${selectedFramework === framework.id ? 'border-blue-500 shadow-lg' : ''}`}
                            onClick={() => handleFrameworkClick(framework.id)}
                        >
                            {loadingFramework === framework.id && (
                                <div className="absolute top-2 right-2">
                                    <LoadingOutlined style={{ fontSize: 16 }} />
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <RegulatoryFrameworkTag standard={framework.id} />
                                </div>
                                <Typography.Text className="text-sm text-gray-400">
                                    {framework.description}
                                </Typography.Text>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default SelectFramework;
