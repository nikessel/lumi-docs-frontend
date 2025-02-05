import React from "react";
import { Modal, Button, Typography, List, Spin } from "antd";
import { CheckCircleFilled, LoadingOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useFilesContext } from "@/contexts/files-context";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface FirstReportModalProps {
    visible: boolean;
    onClose: () => void;
}

const FirstReportModal: React.FC<FirstReportModalProps> = ({ visible, onClose }) => {
    const { files, isLoading } = useFilesContext();
    const router = useRouter();

    const steps = [
        {
            step: 1,
            text: "We have added €25 to your account",
            completed: true,
            route: null,
        },
        {
            step: 2,
            text: "Upload documents",
            completed: files.length > 0,
            loading: isLoading,
            route: "/documents/upload",
        },
        {
            step: 3,
            text: "Create new report",
            completed: false,
            route: "/reports/new",
        },
    ];

    // Determine the next step to be completed
    const nextStep = steps.find((step) => !step.completed);
    const nextStepText = nextStep ? nextStep.text : "All steps completed!";
    const nextStepRoute =
        nextStep?.route === "/documents/upload" ? "/files?open_modal=true" : nextStep?.route || "/dashboard";


    const handleStart = () => {
        router.push(nextStepRoute);
        onClose();
    };

    return (
        <Modal
            title={<Title level={4}>Create Your First Report in 2 Steps</Title>}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="start" type="primary" onClick={handleStart}>
                    {nextStep ? `Continue: ${nextStepText}` : "Go to Dashboard"}
                </Button>,
            ]}
            centered
        >
            <List
                dataSource={steps}
                renderItem={(item) => (
                    <List.Item style={{ borderBottom: "none", padding: "8px 0" }}>
                        <List.Item.Meta
                            avatar={
                                item.loading ? (
                                    <Spin indicator={<LoadingOutlined style={{ fontSize: 18 }} spin />} />
                                ) : item.completed ? (
                                    <CheckCircleFilled style={{ color: "green", fontSize: 18 }} />
                                ) : (
                                    <MinusCircleOutlined style={{ color: "gray", fontSize: 18 }} />
                                )
                            }
                            title={
                                <Text>
                                    <strong>Step {item.step}:</strong> {item.text}
                                </Text>
                            }
                        />
                    </List.Item>
                )}
            />
        </Modal>
    );
};

export default FirstReportModal;
