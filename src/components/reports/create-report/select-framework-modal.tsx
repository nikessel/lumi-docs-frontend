import React from "react";
import { Modal, Typography, Button, Card, Row, Col } from "antd";
import { useRouter } from "next/navigation";
import { RegulatoryFramework } from "@wasm";
import { formatRegulatoryFramework } from "@/utils/helpers";
import { useCreateReportStore } from "@/stores/create-report-store";
import { getSupportedFrameworks } from "@/utils/regulatory-frameworks-utils";
import RegulatoryFrameworkTag from "@/components/reports/regulatory-framework-tag";

interface FrameworkInfo {
    id: RegulatoryFramework;
    description: string;
}

interface SelectFrameworkModalProps {
    visible: boolean;
    onClose: () => void;
}

const SelectFrameworkModal: React.FC<SelectFrameworkModalProps> = ({
    visible,
    onClose
}) => {
    const router = useRouter();
    const { selectedFramework, setSelectedFramework } = useCreateReportStore();
    const frameworks: FrameworkInfo[] = getSupportedFrameworks();

    const handleContinue = () => {
        router.push("/reports/create");
        onClose();
    };

    return (
        <Modal
            title={<Typography.Title level={4} className="mb-4">Select Regulatory Framework</Typography.Title>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width="80%"
        >
            <Typography className="my-4 leading-6" color="secondary">
                Select the regulatory framework you wish to validate your documents against.
            </Typography>
            <Row gutter={[16, 16]}>
                {frameworks.map((framework) => (
                    <Col xs={24} sm={12} md={8} key={framework.id}>
                        <Card
                            hoverable
                            className={`h-full cursor-pointer transition-all ${selectedFramework === framework.id ? 'border-blue-500 shadow-lg' : ''
                                }`}
                            onClick={() => setSelectedFramework(framework.id)}
                        >
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
            {selectedFramework && (
                <div className="mt-6 w-full flex justify-end">
                    <Button type="primary" onClick={handleContinue}>
                        Continue
                    </Button>
                </div>
            )}
        </Modal>
    );
};

export default SelectFrameworkModal;
